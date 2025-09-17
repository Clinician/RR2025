import XCTest
import Foundation

// Create a standalone version of the converter for testing, copy-paste from Video2PPGConverter class
class StandaloneVideo2PPGConverter {
    var imageWidth: Int = 0
    var imageHeight: Int = 0
    var phoneModel: Int = 0
    
    struct PPGResult {
        let timestamp: UInt64
        let signals: [Double]
        let qualityWarning: Bool
    }
    
    func initAlgorithm(width: Int, height: Int, phoneModel: Int) {
        self.imageWidth = width
        self.imageHeight = height
        self.phoneModel = phoneModel
    }
    
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
            
            if ppgValues[3 * r] > maxY {
                maxY = ppgValues[3 * r]
            }
            if ppgValues[3 * r] < minY {
                minY = ppgValues[3 * r]
            }
        }
        
        let maxIntensity: Double = 1100
        let minIntensity: Double = 400
        
        var qualityWarning: Bool
        if maxY < maxIntensity && minY > minIntensity {
            qualityWarning = false
        } else {
            qualityWarning = true
        }
        
        qualityWarning = false
        
        return (ppgValues, qualityWarning)
    }
}

class Video2PPGConverterTests: XCTestCase {
    
    var converter: StandaloneVideo2PPGConverter!
    
    // MARK: - Test Data Structures
    
    struct TestVideoData: Codable {
        let Width: Int
        let Height: Int
        let PhoneModel: Int
        let Frames: [TestFrame]
    }
    
    struct TestFrame: Codable {
        let Timestamp: UInt64
        let YData: [UInt8]
        let UVData: [UInt8]
        let Width: Int
        let Height: Int
    }
    
    // Structure matching the original PPG converter output
    struct PPGOutputFrame: Codable {
        let timestamp: UInt64
        let signals: [Double]
        let qualityWarning: Bool
    }
    
    // MARK: - Setup and Teardown
    
    override func setUp() {
        super.setUp()
        converter = StandaloneVideo2PPGConverter()
    }
    
    override func tearDown() {
        converter = nil
        super.tearDown()
    }
    
    // MARK: - Test Methods
    
    func testConvertFrame2PPGiOS() {
        // Load test data
        guard let testData = loadTestData() else {
            XCTFail("Failed to load test data")
            return
        }
        
        // Initialize the converter
        converter.initAlgorithm(
            width: testData.Width,
            height: testData.Height,
            phoneModel: testData.PhoneModel
        )
        
        var ppgOutputFrames: [PPGOutputFrame] = []
        
        // Process each frame
        for frame in testData.Frames {
            let result = converter.convertFrame2PPGiOS(
                timestamp: frame.Timestamp,
                yChannel: frame.YData,
                uvChannel: frame.UVData
            )
            
            // Create PPG output frame matching original converter format
            let ppgFrame = PPGOutputFrame(
                timestamp: result.timestamp,
                signals: result.signals,
                qualityWarning: result.qualityWarning
            )
            ppgOutputFrames.append(ppgFrame)
            
            // Verify basic properties
            XCTAssertEqual(result.timestamp, frame.Timestamp, "Timestamp should match input")
            XCTAssertEqual(result.signals.count, 30, "Should return 30 signal values (3 * 9 ROIs + 3)")
            XCTAssertFalse(result.signals.isEmpty, "Signals array should not be empty")
        }
        
        // Save PPG output in original converter format
        savePPGOutput(ppgOutputFrames)
        
        // Assertions
        XCTAssertEqual(ppgOutputFrames.count, testData.Frames.count, "Should process all frames")
        XCTAssertFalse(ppgOutputFrames.isEmpty, "Should have processed frames")
        
        print("Test completed successfully!")
        print("Total frames processed: \(ppgOutputFrames.count)")
        print("PPG output saved in original converter format")
    }
    
    // MARK: - Helper Methods
    
    private func loadTestData() -> TestVideoData? {
        guard let url = getTestDataURL() else {
            print("Could not find test data file")
            return nil
        }
        
        do {
            let data = try Data(contentsOf: url)
            let decoder = JSONDecoder()
            let testData = try decoder.decode(TestVideoData.self, from: data)
            print("Successfully loaded test data with \(testData.Frames.count) frames")
            return testData
        } catch {
            print("Error loading test data: \(error)")
            return nil
        }
    }
    
    private func getTestDataURL() -> URL? {
        // Try to find the test data file in the bundle
        if let bundleURL = Bundle(for: type(of: self)).url(forResource: "test_video_data", withExtension: "json") {
            return bundleURL
        }
                
        return nil
    }
    
    private func savePPGOutput(_ ppgFrames: [PPGOutputFrame]) {
        do {
            let encoder = JSONEncoder()
            encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
            let data = try encoder.encode(ppgFrames)
            
            let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
            let outputURL = documentsURL.appendingPathComponent("ppg_output.json")
            
            print("Attempting to save PPG output to: \(outputURL.path)")
            
            try data.write(to: outputURL)
            print("✅ PPG output (original format) saved to: \(outputURL.path)")
            print("📁 You can find the file in the iOS Simulator's Documents folder")
            
        } catch {
            print("❌ Error saving PPG output: \(error)")
        }
    }
}
