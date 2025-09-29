import Foundation
import AVFoundation
import CoreMedia
import CoreVideo

// Swift equivalent of RealTimePPGSignalsProcessor.cs
class RealTimePPGSignalsProcessor: NSObject, AVCaptureVideoDataOutputSampleBufferDelegate {
    private let ppgSignalsProcessor: PPGSignalsProcessor
    private var freeFrames: [Frame] = []
    private let freeFramesLock = NSLock()
    
    init(ppgSignalsCollector: IPPGSignalsCollector) {
        self.ppgSignalsProcessor = PPGSignalsProcessor(ppgSignalsCollector: ppgSignalsCollector, freeFrames: freeFrames)
        super.init()
    }
    
    func terminateProcessing() {
        ppgSignalsProcessor.terminateProcessing()
    }
    
    func processingToCompletionAsync() async {
        await ppgSignalsProcessor.processingToCompletionAsync()
    }
    
    // MARK: - AVCaptureVideoDataOutputSampleBufferDelegate
    
    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        do {
            let frame = bufferToFrame(sampleBuffer)
            ppgSignalsProcessor.enqueue(frame)
        } catch {
            print("Error processing sample buffer: \(error)")
        }
    }
    
    private func bufferToFrame(_ sampleBuffer: CMSampleBuffer) -> Frame {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
            fatalError("Could not get pixel buffer from sample buffer")
        }
        
        CVPixelBufferLockBaseAddress(pixelBuffer, CVPixelBufferLockFlags(rawValue: 0))
        defer {
            CVPixelBufferUnlockBaseAddress(pixelBuffer, CVPixelBufferLockFlags(rawValue: 0))
        }
        
        // Try to get a free frame from the pool
        freeFramesLock.lock()
        let frame = freeFrames.isEmpty ? Frame(Y: Data(), U: Data(), V: Data(), UV: Data(), timestamp: 0) : freeFrames.removeLast()
        freeFramesLock.unlock()
        
        // Set timestamp
        let presentationTimeStamp = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
        frame.timestamp = UInt64(presentationTimeStamp.value)
        
        // Extract Y plane
        let yWidth = CVPixelBufferGetWidthOfPlane(pixelBuffer, 0)
        let yHeight = CVPixelBufferGetHeightOfPlane(pixelBuffer, 0)
        let ySize = yWidth * yHeight
        if let yAddress = CVPixelBufferGetBaseAddressOfPlane(pixelBuffer, 0) {
            frame.Y = Data(bytes: yAddress, count: ySize)
        }
        
        // Extract UV plane
        let uvHeight = CVPixelBufferGetHeightOfPlane(pixelBuffer, 1)
        let uvBytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(pixelBuffer, 1)
        let uvSize = uvHeight * uvBytesPerRow
        if let uvAddress = CVPixelBufferGetBaseAddressOfPlane(pixelBuffer, 1) {
            frame.UV = Data(bytes: uvAddress, count: uvSize)
        }
        
        return frame
    }
}
