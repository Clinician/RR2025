import Foundation

// Swift equivalent of PPGSignalsProcessor.cs
class PPGSignalsProcessor: IPPGSignalsProcessor {
    private static let parallelismDegree = ProcessInfo.processInfo.processorCount
    private static let maxFreeFrames = ProcessInfo.processInfo.processorCount * 4
    
    private let frames = DispatchQueue(label: "frames.queue", attributes: .concurrent)
    private var framesList: [Frame] = []
    private let ppgSignalsCollector: IPPGSignalsCollector
    private let freeFrames: [Frame]
    
    private var cancelTokenSource: DispatchSourceTimer?
    private var processingTasks: [Task<Void, Never>] = []
    private var isCompleted = false
    private let frameListLock = NSLock()
    
    init(ppgSignalsCollector: IPPGSignalsCollector, freeFrames: [Frame]) {
        self.ppgSignalsCollector = ppgSignalsCollector
        self.freeFrames = freeFrames
        
        // Start processing tasks
        for _ in 1...Self.parallelismDegree {
            let task = Task {
                await processFrames()
            }
            processingTasks.append(task)
        }
    }
    
    func enqueue(_ frame: Frame) {
        frameListLock.lock()
        framesList.append(frame)
        let count = framesList.count
        frameListLock.unlock()
        
        if count > Self.parallelismDegree {
            Thread.sleep(forTimeInterval: Double(10 * count / Self.parallelismDegree) / 1000.0)
        }
    }
    
    func processingToCompletionAsync() async {
        if isCompleted {
            return
        }
        
        frameListLock.lock()
        isCompleted = true
        frameListLock.unlock()
        
        let allCompleted = processingTasks.allSatisfy { $0.isCancelled }
        
        if !allCompleted {
            // Wait for tasks to complete or timeout after 100ms
            await withTimeout(seconds: 0.1) {
                await withTaskGroup(of: Void.self) { group in
                    for task in processingTasks {
                        group.addTask {
                            await task.value
                        }
                    }
                }
            }
        }
        
        terminateProcessing()
    }
    
    func terminateProcessing() {
        processingTasks.removeAll()
        cancelTokenSource?.cancel()
        cancelTokenSource = nil
    }
    
    private func processFrames() async {
        while !isCompleted {
            frameListLock.lock()
            let frame = framesList.isEmpty ? nil : framesList.removeFirst()
            frameListLock.unlock()
            
            guard let frame = frame else {
                // Sleep briefly if no frames available
                try? await Task.sleep(nanoseconds: 1_000_000) // 1ms
                continue
            }
            
            do {
                ppgSignalsCollector.processFrame(frame)
                
                // Return frame to free frames pool if not at capacity
                if freeFrames.count < Self.maxFreeFrames {
                    // Note: In Swift, we'd need a thread-safe collection for freeFrames
                    // This is a simplified implementation
                }
            } catch {
                print("Error processing frame: \(error)")
            }
        }
    }
}

// Helper function for timeout
private func withTimeout<T>(seconds: Double, operation: @escaping () async throws -> T) async rethrows -> T? {
    return try await withThrowingTaskGroup(of: T?.self) { group in
        group.addTask {
            try await operation()
        }
        
        group.addTask {
            try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
            return nil
        }
        
        guard let result = try await group.next() else {
            throw CancellationError()
        }
        
        group.cancelAll()
        return result
    }
}
