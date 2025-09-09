import Foundation
import AVFoundation
import UIKit

@objc(VideoFrameExtractor)
class VideoFrameExtractor: NSObject, RCTBridgeModule {
  
  static func moduleName() -> String! {
    return "VideoFrameExtractor"
  }
  
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  // MARK: - Structs
  struct VideoMetadata {
    let width: Int
    let height: Int
    let frameRate: Double
    let duration: Double
    let totalFrames: Int
  }
  
  struct FrameData {
    let yChannel: Data
    let uvChannel: Data
    let timestamp: Double
  }
  
  // MARK: - Public Methods
  
  /// Get video metadata including dimensions, frame rate, and duration
  /// - Parameter videoPath: Path to the video file
  /// - Returns: Video metadata dictionary
  @objc func getVideoMetadata(_ videoPath: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        // Handle both file:// URLs and plain file paths
        let url: URL
        let actualFilePath: String
        
        if videoPath.hasPrefix("file://") {
          url = URL(string: videoPath)!
          actualFilePath = url.path
        } else {
          url = URL(fileURLWithPath: videoPath)
          actualFilePath = videoPath
        }
        
        // Check if file exists using the actual file path
        guard FileManager.default.fileExists(atPath: actualFilePath) else {
          rejecter("FILE_NOT_FOUND", "Video file does not exist at path: \(actualFilePath)", nil)
          return
        }
        
        let asset = AVAsset(url: url)
        
        // Get video track
        guard let videoTrack = asset.tracks(withMediaType: .video).first else {
          rejecter("NO_VIDEO_TRACK", "No video track found in file", nil)
          return
        }
        
        // Get dimensions
        let naturalSize = videoTrack.naturalSize
        let transform = videoTrack.preferredTransform
        
        // Handle rotation
        let size = naturalSize.applying(transform)
        let width = Int(abs(size.width))
        let height = Int(abs(size.height))
        
        // Get frame rate
        let frameRate = Double(videoTrack.nominalFrameRate)
        
        // Get duration
        let duration = CMTimeGetSeconds(asset.duration)
        
        // Calculate total frames
        let totalFrames = Int(duration * frameRate)
        
        let metadata: [String: Any] = [
          "width": width,
          "height": height,
          "frameRate": frameRate,
          "duration": duration,
          "totalFrames": totalFrames
        ]
        
        DispatchQueue.main.async {
          resolver(metadata)
        }
        
      } catch {
        DispatchQueue.main.async {
          rejecter("METADATA_ERROR", "Failed to extract video metadata: \(error.localizedDescription)", error)
        }
      }
    }
  }
  
  /// Extract a specific frame from video and convert to YUV format
  /// - Parameters:
  ///   - videoPath: Path to the video file
  ///   - frameIndex: Index of the frame to extract (0-based)
  ///   - totalFrames: Total number of frames in the video
  /// - Returns: Frame data with Y and UV channels
  @objc func extractFrame(_ videoPath: String, frameIndex: NSNumber, totalFrames: NSNumber, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        // Handle both file:// URLs and plain file paths
        let url: URL
        let actualFilePath: String
        
        if videoPath.hasPrefix("file://") {
          url = URL(string: videoPath)!
          actualFilePath = url.path
        } else {
          url = URL(fileURLWithPath: videoPath)
          actualFilePath = videoPath
        }
        
        // Check if file exists
        guard FileManager.default.fileExists(atPath: actualFilePath) else {
          rejecter("FILE_NOT_FOUND", "Video file does not exist at path: \(actualFilePath)", nil)
          return
        }
        
        let asset = AVAsset(url: url)
        
        // Create image generator
        let imageGenerator = AVAssetImageGenerator(asset: asset)
        imageGenerator.appliesPreferredTrackTransform = true
        imageGenerator.requestedTimeToleranceAfter = .zero
        imageGenerator.requestedTimeToleranceBefore = .zero
        
        // Calculate time for the frame
        let duration = CMTimeGetSeconds(asset.duration)
        let frameTime = duration * Double(frameIndex.intValue) / Double(totalFrames.intValue)
        let time = CMTime(seconds: frameTime, preferredTimescale: 600)
        
        // Extract frame
        let cgImage = try imageGenerator.copyCGImage(at: time, actualTime: nil)
        
        // Convert to YUV
        let frameData = try self.convertImageToYUV(cgImage: cgImage)
        
        let result: [String: Any] = [
          "yChannel": frameData.yChannel.base64EncodedString(),
          "uvChannel": frameData.uvChannel.base64EncodedString(),
          "timestamp": frameData.timestamp
        ]
        
        DispatchQueue.main.async {
          resolver(result)
        }
        
      } catch {
        DispatchQueue.main.async {
          rejecter("FRAME_EXTRACTION_ERROR", "Failed to extract frame: \(error.localizedDescription)", error)
        }
      }
    }
  }
  
  /// Extract multiple frames from video in batch
  /// - Parameters:
  ///   - videoPath: Path to the video file
  ///   - frameIndices: Array of frame indices to extract
  ///   - totalFrames: Total number of frames in the video
  /// - Returns: Array of frame data
  @objc func extractFrames(_ videoPath: String, frameIndices: [NSNumber], totalFrames: NSNumber, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        // Handle both file:// URLs and plain file paths
        let url: URL
        let actualFilePath: String
        
        if videoPath.hasPrefix("file://") {
          url = URL(string: videoPath)!
          actualFilePath = url.path
        } else {
          url = URL(fileURLWithPath: videoPath)
          actualFilePath = videoPath
        }
        
        // Check if file exists
        guard FileManager.default.fileExists(atPath: actualFilePath) else {
          rejecter("FILE_NOT_FOUND", "Video file does not exist at path: \(actualFilePath)", nil)
          return
        }
        
        let asset = AVAsset(url: url)
        
        // Create image generator
        let imageGenerator = AVAssetImageGenerator(asset: asset)
        imageGenerator.appliesPreferredTrackTransform = true
        imageGenerator.requestedTimeToleranceAfter = .zero
        imageGenerator.requestedTimeToleranceBefore = .zero
        
        var results: [[String: Any]] = []
        let duration = CMTimeGetSeconds(asset.duration)
        
        for frameIndex in frameIndices {
          do {
            // Calculate time for the frame
            let frameTime = duration * Double(frameIndex.intValue) / Double(totalFrames.intValue)
            let time = CMTime(seconds: frameTime, preferredTimescale: 600)
            
            // Extract frame
            let cgImage = try imageGenerator.copyCGImage(at: time, actualTime: nil)
            
            // Convert to YUV
            let frameData = try self.convertImageToYUV(cgImage: cgImage)
            
            let result: [String: Any] = [
              "frameIndex": frameIndex.intValue,
              "yChannel": frameData.yChannel.base64EncodedString(),
              "uvChannel": frameData.uvChannel.base64EncodedString(),
              "timestamp": frameData.timestamp
            ]
            
            results.append(result)
            
          } catch {
            print("Failed to extract frame \(frameIndex): \(error)")
            // Continue with other frames
          }
        }
        
        DispatchQueue.main.async {
          resolver(results)
        }
        
      } catch {
        DispatchQueue.main.async {
          rejecter("BATCH_EXTRACTION_ERROR", "Failed to extract frames: \(error.localizedDescription)", error)
        }
      }
    }
  }
  
  // MARK: - Private Methods
  
  /// Convert CGImage to YUV format
  private func convertImageToYUV(cgImage: CGImage) throws -> FrameData {
    let width = cgImage.width
    let height = cgImage.height
    
    // Create RGB data
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let bytesPerPixel = 4
    let bytesPerRow = bytesPerPixel * width
    let bitsPerComponent = 8
    
    var rgbData = Data(count: height * bytesPerRow)
    
    rgbData.withUnsafeMutableBytes { rawBufferPointer in
      let context = CGContext(
        data: rawBufferPointer.baseAddress,
        width: width,
        height: height,
        bitsPerComponent: bitsPerComponent,
        bytesPerRow: bytesPerRow,
        space: colorSpace,
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
      )
      
      context?.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
    }
    
    // Convert RGB to YUV
    let yChannelSize = width * height
    let uvChannelSize = width * height / 2
    
    var yChannel = Data(count: yChannelSize)
    var uvChannel = Data(count: uvChannelSize)
    
    rgbData.withUnsafeBytes { rgbBytes in
      yChannel.withUnsafeMutableBytes { yBytes in
        uvChannel.withUnsafeMutableBytes { uvBytes in
          let rgbPointer = rgbBytes.bindMemory(to: UInt8.self)
          let yPointer = yBytes.bindMemory(to: UInt8.self)
          let uvPointer = uvBytes.bindMemory(to: UInt8.self)
          
          var uvIndex = 0
          
          for y in 0..<height {
            for x in 0..<width {
              let rgbIndex = (y * width + x) * 4
              let r = Float(rgbPointer[rgbIndex])
              let g = Float(rgbPointer[rgbIndex + 1])
              let b = Float(rgbPointer[rgbIndex + 2])
              
              // Convert RGB to YUV using ITU-R BT.601 standard
              let yValue = 0.299 * r + 0.587 * g + 0.114 * b
              let uValue = -0.169 * r - 0.331 * g + 0.500 * b + 128
              let vValue = 0.500 * r - 0.419 * g - 0.081 * b + 128
              
              // Store Y value
              let yIndex = y * width + x
              yPointer[yIndex] = UInt8(max(0, min(255, yValue)))
              
              // Store UV values (subsampled 4:2:0)
              if y % 2 == 0 && x % 2 == 0 {
                uvPointer[uvIndex] = UInt8(max(0, min(255, uValue)))
                uvPointer[uvIndex + 1] = UInt8(max(0, min(255, vValue)))
                uvIndex += 2
              }
            }
          }
        }
      }
    }
    
    return FrameData(
      yChannel: yChannel,
      uvChannel: uvChannel,
      timestamp: Date().timeIntervalSince1970 * 1000 // milliseconds
    )
  }
}
