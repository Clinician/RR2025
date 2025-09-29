## Building and Running

### Prerequisites
- .NET 8.0 SDK or later

### Build
```bash
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

## Usage Examples

### Basic Usage
```bash
dotnet run sample_video_data.json
```

### Custom Output File
```bash
dotnet run my_video_data.json my_results.json
```
