# PPG Data Comparator

A C# console application that compares two PPG JSON files to determine if they contain identical data structures and values.

## Usage

```bash
# Navigate to the comparator directory
cd src/original-ppg-comparator

# Build the comparator
dotnet build

# Run the comparator
dotnet run file1.json file2.json [tolerance]
```

### Parameters

- `file1.json` - First PPG data file to compare
- `file2.json` - Second PPG data file to compare  
- `tolerance` - Optional floating point tolerance for signal comparison (default: 1e-10)

### Examples

```bash
# Navigate to the comparator directory
cd src/original-ppg-comparator

# Compare two PPG files with default tolerance
dotnet run output.json test_output.json

# Compare with custom tolerance
dotnet run output.json test_output.json 0.001

# Compare iOS test output with original converter output
dotnet run ../original-ppg-converter/output.json ../../ios/rivaTests/ppg_output.json
```
