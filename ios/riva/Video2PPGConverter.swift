import Foundation
import UIKit
import React

@objc(Video2PPGConverter)
class Video2PPGConverter: NSObject, RCTBridgeModule {
  
  static func moduleName() -> String! {
    return "Video2PPGConverter"
  }
  
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  // MARK: - Properties
  var imageWidth: Int = 0
  var imageHeight: Int = 0
  var phoneModel: Int = 0
  
  // MARK: - Structs
  struct PPGResult {
    let timestamp: UInt64
    let signals: [Double]
    let qualityWarning: Bool
  }
  
  // MARK: - Initialization
  override init() {
    super.init()
  }
  
  // MARK: - Public Methods
  
  /// Initializes the algorithm. Must be called before the conversion functions.
  /// - Parameters:
  ///   - width: Width of the image in pixels
  ///   - height: Height of the image in pixels
  ///   - phoneModel: Phone model identifier
  func initAlgorithm(width: Int, height: Int, phoneModel: Int) {
    self.imageWidth = width
    self.imageHeight = height
    self.phoneModel = phoneModel
  }
  
  /// Converts video frame to PPG signal for iOS (UV channels mixed together)
  /// - Parameters:
  ///   - timestamp: Timestamp when the image was acquired (in ms)
  ///   - yChannel: Y pixel array (width * height)
  ///   - uvChannel: UV pixel values
  /// - Returns: PPG-like signals and quality index
  func convertFrame2PPGiOS(timestamp: UInt64, yChannel: [UInt8], uvChannel: [UInt8]) -> PPGResult {
    let numberOfROIs = 3
    
    let (ppgValues, qualityWarning) = extractFeaturesiOS(
      yChannel: yChannel,
      numberOfROIsByRow: numberOfROIs,
      numberOfROIsByColumns: numberOfROIs,
      width: imageWidth,
      height: imageHeight,
      phoneModel: phoneModel
    )
    
    return PPGResult(
      timestamp: timestamp,
      signals: ppgValues,
      qualityWarning: qualityWarning
    )
  }
  
  // MARK: - Private Methods
  
  /// Extracts features for iOS implementation
  private func extractFeaturesiOS(
    yChannel: [UInt8],
    numberOfROIsByRow: Int,
    numberOfROIsByColumns: Int,
    width: Int,
    height: Int,
    phoneModel: Int
  ) -> ([Double], Bool) {
    
    let numberOfROIs = numberOfROIsByColumns * numberOfROIsByRow
    let sizeY = width * height
    let widthStep = width / numberOfROIsByRow
    let heightStep = height / numberOfROIsByColumns
    
    var row = 1
    var maxY: Double = 0
    var minY: Double = 100000
    var rest = 0
    var roiMeanY: Double = 0
    
    var ppgValues = Array(repeating: 0.0, count: 3 * numberOfROIs + 3)
    
    for r in 0..<numberOfROIs {
      var numPixels = 0
      roiMeanY = 0
      
      let xOffset = (r * widthStep + rest) % width
      let yOffset = ((r * widthStep + rest) / width) * heightStep
      
      var roiWidth: Int
      if Double((r + 2) * widthStep) / Double(width) > Double(row) {
        roiWidth = width - xOffset
        rest += row * width - ((r + 1) * widthStep + rest)
        row += 1
      } else {
        roiWidth = widthStep
      }
      
      var roiHeight: Int
      if Double(((r + 2) * widthStep)) / Double(width) * Double(heightStep) / Double(height) > 1 {
        roiHeight = height - yOffset
      } else {
        roiHeight = heightStep
      }
      
      for i in xOffset..<(xOffset + roiWidth) {
        for j in yOffset..<(yOffset + roiHeight) {
          let xBy2 = i / 2
          let yBy2 = j / 2
          let yValue = Double(yChannel[i + j * width])
          roiMeanY += yValue
          numPixels += 1
        }
      }
      
      ppgValues[3 * r] = roiMeanY / Double(numPixels)
      
      // Get max and min mean luminance between ROIs
      if ppgValues[3 * r] > maxY {
        maxY = ppgValues[3 * r]
      }
      if ppgValues[3 * r] < minY {
        minY = ppgValues[3 * r]
      }
    }
    
    // Check luminance variance and min/max between ROIs
    let maxIntensity: Double = 1100  // Intensities observed from 60fps tests in January 2019
    let minIntensity: Double = 400
    
    var qualityWarning: Bool
    if maxY < maxIntensity && minY > minIntensity {
      qualityWarning = false
    } else {
      qualityWarning = true
    }
    
    // Override quality warning as in original code
    qualityWarning = false
    
    return (ppgValues, qualityWarning)
  }
}
  
    
// MARK: - React Native Bridge Extension
extension Video2PPGConverter {
    
    /// React Native compatible method for iOS PPG conversion
    @objc func convertFrameiOS(_ timestamp: NSNumber, 
                              yData: NSString, 
                              uvData: NSString, 
                              resolver: @escaping RCTPromiseResolveBlock, 
                              rejecter: @escaping RCTPromiseRejectBlock) {
        
        guard imageWidth > 0 && imageHeight > 0 else {
            rejecter("INIT_ERROR", "Algorithm not initialized. Call initAlgorithm first.", nil)
            return
        }
        
        // Convert base64 strings to Data
        guard let yDataDecoded = Data(base64Encoded: yData as String),
              let uvDataDecoded = Data(base64Encoded: uvData as String) else {
            rejecter("DECODE_ERROR", "Failed to decode base64 data", nil)
            return
        }
        
        let yBytes = [UInt8](yDataDecoded)
        let uvBytes = [UInt8](uvDataDecoded)
        
        let result = convertFrame2PPGiOS(
            timestamp: timestamp.uint64Value,
            yChannel: yBytes,
            uvChannel: uvBytes
        )
        
        let response: [String: Any] = [
            "timestamp": result.timestamp,
            "signals": result.signals,
            "qualityWarning": result.qualityWarning
        ]
        
        resolver(response)
    }
    
    /// React Native compatible initialization method
    @objc func initAlgorithm(_ width: NSNumber,
                            height: NSNumber,
                            phoneModel: NSNumber,
                            resolver: @escaping RCTPromiseResolveBlock,
                            rejecter: @escaping RCTPromiseRejectBlock) {
        
        initAlgorithm(
            width: width.intValue,
            height: height.intValue,
            phoneModel: phoneModel.intValue
        )
        
        resolver(["success": true])
    }
}
