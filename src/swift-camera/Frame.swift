import Foundation

// Swift equivalent of Frame.cs
class Frame {
    var Y: Data
    var U: Data
    var V: Data
    var UV: Data
    var timestamp: UInt64
    
    init(Y: Data, U: Data, V: Data, UV: Data, timestamp: UInt64) {
        self.Y = Y
        self.U = U
        self.V = V
        self.UV = UV
        self.timestamp = timestamp
    }
}
