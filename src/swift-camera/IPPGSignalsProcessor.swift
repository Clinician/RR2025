import Foundation

// Swift equivalent of IPPGSignalsProcessor.cs
protocol IPPGSignalsProcessor {
    func enqueue(_ frame: Frame)
    func processingToCompletionAsync() async
    func terminateProcessing()
}
