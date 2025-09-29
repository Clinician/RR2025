import Foundation
import AVFoundation
import CoreMedia
import CoreVideo

// Swift equivalent of RealTimeProcessingCamera.cs
class RealTimeProcessingCamera: ICamera {
    private var recordingTask: Task<Void, Error>?
    private var externalCancellationToken: CancellationToken?
    private var session: AVCaptureSession?
    private var ppgSignalsProcessor: RealTimePPGSignalsProcessor?
    private var dispatchQueue: DispatchQueue?
    
    // Semaphore for thread-safe finalization
    private let semaphoreFinalize = DispatchSemaphore(value: 1)
    
    var ppgSignalsCollector: IPPGSignalsCollector?
    
    let cameraSettings = CameraSettings(
        frameRate: 60,
        frameWidth: 1280,
        frameHeight: 720,
        duration: 30.0
    )
    
    func isCameraSupported() -> Bool {
        return true
    }
    
    func isFullHardwareSupported() -> Bool {
        return true
    }
    
    func startRecordingAsync(cancellationToken: CancellationToken) async throws {
        self.externalCancellationToken = cancellationToken
        cancellationToken.register { [weak self] in
            self?.onCancelRequested()
        }
        
        ensureRecordingTask()
        
        if !setupCaptureSession() {
            throw NSError(domain: "RealTimeProcessingCamera", code: 1, userInfo: [NSLocalizedDescriptionKey: "Cannot initialize recording"])
        }
        
        if let recordingTask = recordingTask {
            try await recordingTask.value
        } else {
            throw NSError(domain: "RealTimeProcessingCamera", code: 2, userInfo: [NSLocalizedDescriptionKey: "Cannot initialize recording"])
        }
    }
    
    private func ensureRecordingTask() {
        if recordingTask != nil {
            finalizeRecordingTask()
        }
        
        recordingTask = Task {
            // Task will be completed by the timer or cancellation
            try await withCheckedThrowingContinuation { continuation in
                // Set up timer to complete after duration
                DispatchQueue.main.asyncAfter(deadline: .now() + cameraSettings.duration) {
                    continuation.resume()
                }
            }
        }
    }
    
    private func setupCaptureSession() -> Bool {
        session = AVCaptureSession()
        
        guard let captureDevice = getCaptureDevice() else {
            print("No captureDevice - this won't work on the simulator, try a physical device")
            return false
        }
        
        guard let input = try? AVCaptureDeviceInput(device: captureDevice) else {
            print("No input - this won't work on the simulator, try a physical device")
            return false
        }
        
        session?.addInput(input)
        
        do {
            try captureDevice.lockForConfiguration()
        } catch {
            print("Error locking device for configuration: \(error)")
            return false
        }
        
        // Get capture device format
        guard let formatInfo = getCaptureDeviceFormat(captureDevice) else {
            captureDevice.unlockForConfiguration()
            return false
        }
        
        captureDevice.activeFormat = formatInfo.format
        let cmTime = CMTime(value: 10, timescale: CMTimeScale(formatInfo.frameRate * 10))
        captureDevice.activeVideoMinFrameDuration = cmTime
        captureDevice.activeVideoMaxFrameDuration = cmTime
        
        captureDevice.unlockForConfiguration()
        
        // Set up video output
        let output = AVCaptureVideoDataOutput()
        output.videoSettings = [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarFullRange
        ]
        
        dispatchQueue = DispatchQueue(label: "myQueue")
        ppgSignalsCollector = PPGSignalsCollector.createiOsCollector(width: formatInfo.frameWidth, height: formatInfo.frameHeight)
        ppgSignalsProcessor = RealTimePPGSignalsProcessor(ppgSignalsCollector: ppgSignalsCollector!)
        
        output.setSampleBufferDelegate(ppgSignalsProcessor, queue: dispatchQueue)
        session?.addOutput(output)
        
        session?.startRunning()
        
        // Configure torch and flash
        session?.beginConfiguration()
        
        do {
            try captureDevice.lockForConfiguration()
        } catch {
            print("Error locking device for configuration: \(error)")
            captureDevice.unlockForConfiguration()
            return false
        }
        
        if captureDevice.isTorchAvailable {
            captureDevice.torchMode = .on
        }
        
        if captureDevice.isFlashAvailable {
            captureDevice.flashMode = .on
        }
        
        captureDevice.unlockForConfiguration()
        session?.commitConfiguration()
        
        // Set up completion timer
        DispatchQueue.main.asyncAfter(deadline: .now() + cameraSettings.duration) { [weak self] in
            self?.finalizeRecordingTask()
        }
        
        return true
    }
    
    private func getCaptureDevice() -> AVCaptureDevice? {
        // Try telephoto camera first (closer to flashlight)
        if let device = AVCaptureDevice.default(.builtInTelephotoCamera, for: .video, position: .back) {
            return device
        }
        
        // Otherwise try back camera
        return AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back)
    }
    
    private func getCaptureDeviceFormat(_ captureDevice: AVCaptureDevice) -> (format: AVCaptureDevice.Format, frameRate: Int, frameWidth: Int, frameHeight: Int)? {
        let formats = captureDevice.formats.compactMap { format -> (format: AVCaptureDevice.Format, frameRate: Int, frameWidth: Int, frameHeight: Int)? in
            guard format.formatDescription.mediaSubType == kCVPixelFormatType_420YpCbCr8BiPlanarFullRange else {
                return nil
            }
            
            let dimensions = CMVideoFormatDescriptionGetDimensions(format.formatDescription)
            let maxFrameRate = Int(format.videoSupportedFrameRateRanges.first?.maxFrameRate ?? 0)
            
            return (format: format, frameRate: maxFrameRate, frameWidth: Int(dimensions.width), frameHeight: Int(dimensions.height))
        }
        
        let matched = formats.filter { info in
            info.frameRate >= cameraSettings.frameRate &&
            info.frameWidth >= cameraSettings.frameWidth &&
            info.frameHeight >= cameraSettings.frameHeight
        }.sorted { lhs, rhs in
            let lhsArea = lhs.frameWidth * lhs.frameHeight
            let rhsArea = rhs.frameWidth * rhs.frameHeight
            if lhsArea != rhsArea {
                return lhsArea < rhsArea
            }
            return lhs.frameRate < rhs.frameRate
        }
        
        return matched.first
    }
    
    // MARK: - Resource Management
    
    private func finalizeRecordingTask() {
        semaphoreFinalize.wait()
        defer { semaphoreFinalize.signal() }
        
        session?.stopRunning()
        
        if let processor = ppgSignalsProcessor {
            Task {
                await processor.processingToCompletionAsync()
                
                DispatchQueue.main.async { [weak self] in
                    self?.ppgSignalsProcessor = nil
                }
            }
        }
        
        recordingTask = nil
        freeResources()
    }
    
    private func finalizeRecordingTask(error: Error) {
        semaphoreFinalize.wait()
        defer { semaphoreFinalize.signal() }
        
        session?.stopRunning()
        
        ppgSignalsProcessor?.terminateProcessing()
        ppgSignalsProcessor = nil
        
        recordingTask?.cancel()
        recordingTask = nil
        
        freeResources()
    }
    
    private func onCancelRequested() {
        let error = NSError(domain: "RealTimeProcessingCamera", code: 3, userInfo: [NSLocalizedDescriptionKey: "Operation canceled"])
        finalizeRecordingTask(error: error)
    }
    
    private func freeResources() {
        session = nil
        dispatchQueue = nil
    }
}
