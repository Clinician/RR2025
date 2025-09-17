# iOS PPG Converter Runner

A C# console application that processes video frame data using the iOS PPG (Photoplethysmography) converter algorithm.

## Overview

This application loads video frame data from a JSON file and processes it using the `Video2PPGConverter` class with the iOS-specific `ConvertFrame2PPGiOS` method. It outputs PPG signals that can be used for heart rate analysis and other physiological measurements.

## Files

- `Video2PPGConverter.cs` - Original PPG converter algorithm
- `PPGConverterRunner.cs` - Console application runner
- `PPGConverter.csproj` - .NET 6.0 project file
- `sample_video_data.json` - Sample input data for testing
- `README.md` - This documentation

## Building and Running

### Prerequisites
- .NET 6.0 SDK or later

### Build
```bash
cd /Users/nikolakolev/projects/riva/src/original-ppg-converter
dotnet build
```

### Run
```bash
# Using sample data
dotnet run sample_video_data.json

# Using custom input file
dotnet run your_video_data.json output_results.json
```

## Input File Format

The input JSON file should contain video frame data in the following format:

```json
{
  "Width": 640,
  "Height": 480,
  "PhoneModel": 1,
  "Frames": [
    {
      "Timestamp": 1634567890000,
      "YData": [array of Y channel bytes],
      "UVData": [array of UV channel bytes],
      "Width": 640,
      "Height": 480
    }
  ]
}
```

### Field Descriptions

- **Width/Height**: Video frame dimensions in pixels
- **PhoneModel**: Integer identifier for phone model (used in algorithm)
- **Frames**: Array of video frames
  - **Timestamp**: Frame timestamp in milliseconds
  - **YData**: Y (luminance) channel data as byte array (Width × Height elements)
  - **UVData**: UV (chrominance) channel data as byte array (interleaved U and V)

## Output

The application generates a JSON file containing:

- **PPGSignals**: Array of processed PPG signal data
- **TotalFrames**: Number of input frames processed
- **QualityWarnings**: Count of frames with quality issues
- **ProcessingTimeMs**: Total processing time in milliseconds
- **ProcessedAt**: Timestamp when processing completed

### Sample Output Structure

```json
{
  "ppgSignals": [
    {
      "timestamp": 1634567890000,
      "signals": [120.5, 125.3, 130.1, ...],
      "qualityWarning": false
    }
  ],
  "totalFrames": 3,
  "qualityWarnings": 0,
  "processingTimeMs": 15.2,
  "processedAt": "2024-01-15T10:30:45.123Z"
}
```

## Algorithm Details

The iOS PPG converter processes video frames by:

1. Dividing each frame into regions of interest (ROIs)
2. Calculating mean luminance values for each ROI
3. Extracting PPG-like signals from the luminance data
4. Performing quality checks based on intensity thresholds
5. Returning processed signals with quality indicators

## Usage Examples

### Basic Usage
```bash
dotnet run sample_video_data.json
```

### Custom Output File
```bash
dotnet run my_video_data.json my_results.json
```

### Processing Real Data
To process real video data, you'll need to:

1. Extract frames from your video file
2. Convert frames to YUV format
3. Create JSON input file with the required structure
4. Run the converter

## Performance

The application displays real-time progress and provides detailed statistics:
- Processing time per frame
- Total processing duration
- Signal quality metrics
- Statistical analysis of generated signals

## Troubleshooting

### Common Issues

1. **File not found**: Ensure input file path is correct
2. **Invalid JSON**: Validate JSON format using online tools
3. **Array size mismatch**: Verify YData array size matches Width × Height
4. **Memory issues**: For large datasets, consider processing in batches

### Error Messages

- `Input file not found`: Check file path and permissions
- `Invalid JSON format`: Validate JSON syntax
- `Frame data size mismatch`: Verify YData array dimensions
- `Failed to save results`: Check output directory permissions

## Technical Notes

- The iOS converter expects interleaved UV data format
- Quality warnings are based on luminance intensity thresholds
- Processing is single-threaded for consistency
- All timestamps should be in milliseconds
- Phone model parameter affects algorithm behavior

## Sample Data

The included `sample_video_data.json` contains 3 frames of synthetic data for testing purposes. For real PPG analysis, you'll need actual video frame data captured from a device camera with proper lighting conditions (typically using camera flash).
