import Foundation

// Swift equivalent of PpgSignal.cs
class PpgSignalPack {
    var phoneModel: String?
    var phoneOSVersion: String?
    var infoSupportedHardwareLevel: String?
    var ppgSignals: [PpgSignal]?
    var calibration: Calibration?
    
    init() {}
}

class PpgSignal {
    var timestamp: UInt64
    var signals: [Double]
    var qualityWarning: Bool
    
    init(timestamp: UInt64, signals: [Double], qualityWarning: Bool) {
        self.timestamp = timestamp
        self.signals = signals
        self.qualityWarning = qualityWarning
    }
}

class Calibration {
    var dia: Int
    var sys: Int
    var type: String?
    
    init(dia: Int, sys: Int, type: String? = nil) {
        self.dia = dia
        self.sys = sys
        self.type = type
    }
}
