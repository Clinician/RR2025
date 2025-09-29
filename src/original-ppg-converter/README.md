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

### Field Descriptions

- **Width/Height**: Video frame dimensions in pixels
- **PhoneModel**: Integer identifier for phone model (used in algorithm)
- **Frames**: Array of video frames
  - **Timestamp**: Frame timestamp in milliseconds
  - **YData**: Y (luminance) channel data as byte array (Width × Height elements)
  - **UVData**: UV (chrominance) channel data as byte array (interleaved U and V)
