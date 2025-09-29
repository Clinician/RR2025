import Foundation

// Swift equivalent of ICamera interface and CameraSettings class
protocol ICamera {
    var ppgSignalsCollector: IPPGSignalsCollector? { get }
    var cameraSettings: CameraSettings { get }
    
    func isCameraSupported() -> Bool
    func isFullHardwareSupported() -> Bool
    func startRecordingAsync(cancellationToken: CancellationToken) async throws
}

class CameraSettings {
    let frameRate: Int
    let frameWidth: Int
    let frameHeight: Int
    let duration: TimeInterval
    
    init(frameRate: Int, frameWidth: Int, frameHeight: Int, duration: TimeInterval) {
        self.frameRate = frameRate
        self.frameWidth = frameWidth
        self.frameHeight = frameHeight
        self.duration = duration
    }
}

// Simple cancellation token implementation
class CancellationToken {
    private var isCancelled = false
    private var cancellationHandlers: [() -> Void] = []
    private let lock = NSLock()
    
    var isCancellationRequested: Bool {
        lock.lock()
        defer { lock.unlock() }
        return isCancelled
    }
    
    func register(_ handler: @escaping () -> Void) {
        lock.lock()
        defer { lock.unlock() }
        
        if isCancelled {
            handler()
        } else {
            cancellationHandlers.append(handler)
        }
    }
    
    func cancel() {
        lock.lock()
        let handlers = cancellationHandlers
        isCancelled = true
        cancellationHandlers.removeAll()
        lock.unlock()
        
        for handler in handlers {
            handler()
        }
    }
}
