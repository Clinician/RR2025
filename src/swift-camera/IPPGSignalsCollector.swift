import Foundation

// Swift equivalent of IPPGSignalsCollector.cs
protocol IPPGSignalsCollector {
    var signalsCount: Int { get }
    var qualityWarnings: Int { get }
    var data: [PpgSignal] { get }
    
    func processFrame(_ frame: Frame)
}
