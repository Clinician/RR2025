using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Linq;

namespace CamPPG
{
    /// <summary>
    /// PPG frame data structure matching the output.json format
    /// </summary>
    public class PPGFrame
    {
        public ulong Timestamp { get; set; }
        public double[] Signals { get; set; } = Array.Empty<double>();
        public bool QualityWarning { get; set; }
    }

    /// <summary>
    /// Comparison result for a single PPG frame
    /// </summary>
    public class FrameComparisonResult
    {
        public int FrameIndex { get; set; }
        public bool TimestampMatch { get; set; }
        public bool QualityWarningMatch { get; set; }
        public bool SignalsMatch { get; set; }
        public int SignalCount1 { get; set; }
        public int SignalCount2 { get; set; }
        public List<int> DifferentSignalIndices { get; set; } = new List<int>();
        public double MaxSignalDifference { get; set; }
        public string? ErrorMessage { get; set; }
    }

    /// <summary>
    /// Overall comparison result
    /// </summary>
    public class ComparisonResult
    {
        public bool FilesIdentical { get; set; }
        public int TotalFrames1 { get; set; }
        public int TotalFrames2 { get; set; }
        public int MatchingFrames { get; set; }
        public int DifferentFrames { get; set; }
        public List<FrameComparisonResult> FrameResults { get; set; } = new List<FrameComparisonResult>();
        public List<string> Errors { get; set; } = new List<string>();
        public double Tolerance { get; set; }
    }

    /// <summary>
    /// Console application to compare two PPG JSON files
    /// </summary>
    class PPGComparator
    {
        private const double DEFAULT_TOLERANCE = 1e-10; // Default tolerance for floating point comparison

        static void Main(string[] args)
        {
            Console.WriteLine("=== PPG Data Comparator ===");
            Console.WriteLine();

            if (args.Length < 2)
            {
                Console.WriteLine("Usage: PPGComparator <file1.json> <file2.json> [tolerance]");
                Console.WriteLine("  file1.json    - First PPG data file to compare");
                Console.WriteLine("  file2.json    - Second PPG data file to compare");
                Console.WriteLine("  tolerance     - Optional floating point tolerance (default: 1e-10)");
                return;
            }

            string file1 = args[0];
            string file2 = args[1];
            double tolerance = args.Length > 2 && double.TryParse(args[2], out double t) ? t : DEFAULT_TOLERANCE;

            try
            {
                Console.WriteLine($"Comparing files:");
                Console.WriteLine($"  File 1: {file1}");
                Console.WriteLine($"  File 2: {file2}");
                Console.WriteLine($"  Tolerance: {tolerance:E}");
                Console.WriteLine();

                // Load both files
                List<PPGFrame> data1 = LoadPPGData(file1);
                List<PPGFrame> data2 = LoadPPGData(file2);

                Console.WriteLine($"Loaded {data1.Count} frames from file 1");
                Console.WriteLine($"Loaded {data2.Count} frames from file 2");
                Console.WriteLine();

                // Compare the data
                ComparisonResult result = CompareData(data1, data2, tolerance);

                // Display results
                DisplayResults(result);

                // Exit with appropriate code
                Environment.Exit(result.FilesIdentical ? 0 : 1);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                Environment.Exit(2);
            }
        }

        static List<PPGFrame> LoadPPGData(string filePath)
        {
            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException($"File not found: {filePath}");
            }

            string jsonContent = File.ReadAllText(filePath);
            
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                
                List<PPGFrame>? ppgData = JsonSerializer.Deserialize<List<PPGFrame>>(jsonContent, options);
                
                if (ppgData == null)
                {
                    throw new InvalidDataException($"Failed to deserialize PPG data from {filePath}");
                }

                return ppgData;
            }
            catch (JsonException ex)
            {
                throw new InvalidDataException($"Invalid JSON format in {filePath}: {ex.Message}");
            }
        }

        static ComparisonResult CompareData(List<PPGFrame> data1, List<PPGFrame> data2, double tolerance)
        {
            var result = new ComparisonResult
            {
                TotalFrames1 = data1.Count,
                TotalFrames2 = data2.Count,
                Tolerance = tolerance
            };

            // Check if frame counts match
            if (data1.Count != data2.Count)
            {
                result.Errors.Add($"Frame count mismatch: File 1 has {data1.Count} frames, File 2 has {data2.Count} frames");
                result.FilesIdentical = false;
            }

            // Compare each frame
            int framesToCompare = Math.Min(data1.Count, data2.Count);
            
            Console.WriteLine("Comparing frames...");
            for (int i = 0; i < framesToCompare; i++)
            {
                if (i % 100 == 0 || i == framesToCompare - 1)
                {
                    double progress = (double)(i + 1) / framesToCompare * 100;
                    Console.Write($"\rProgress: {progress:F1}% ({i + 1}/{framesToCompare})");
                }

                var frameResult = CompareFrames(data1[i], data2[i], i, tolerance);
                result.FrameResults.Add(frameResult);

                if (frameResult.TimestampMatch && frameResult.QualityWarningMatch && frameResult.SignalsMatch)
                {
                    result.MatchingFrames++;
                }
                else
                {
                    result.DifferentFrames++;
                }
            }

            Console.WriteLine(); // New line after progress

            // Overall result
            result.FilesIdentical = result.Errors.Count == 0 && result.DifferentFrames == 0;

            return result;
        }

        static FrameComparisonResult CompareFrames(PPGFrame frame1, PPGFrame frame2, int frameIndex, double tolerance)
        {
            var result = new FrameComparisonResult
            {
                FrameIndex = frameIndex,
                SignalCount1 = frame1.Signals?.Length ?? 0,
                SignalCount2 = frame2.Signals?.Length ?? 0
            };

            try
            {
                // Compare timestamps
                result.TimestampMatch = frame1.Timestamp == frame2.Timestamp;

                // Compare quality warnings
                result.QualityWarningMatch = frame1.QualityWarning == frame2.QualityWarning;

                // Compare signals
                if (frame1.Signals == null && frame2.Signals == null)
                {
                    result.SignalsMatch = true;
                }
                else if (frame1.Signals == null || frame2.Signals == null)
                {
                    result.SignalsMatch = false;
                    result.ErrorMessage = "One frame has null signals array";
                }
                else if (frame1.Signals.Length != frame2.Signals.Length)
                {
                    result.SignalsMatch = false;
                    result.ErrorMessage = $"Signal array length mismatch: {frame1.Signals.Length} vs {frame2.Signals.Length}";
                }
                else
                {
                    result.SignalsMatch = true;
                    double maxDiff = 0;

                    for (int i = 0; i < frame1.Signals.Length; i++)
                    {
                        double diff = Math.Abs(frame1.Signals[i] - frame2.Signals[i]);
                        maxDiff = Math.Max(maxDiff, diff);

                        if (diff > tolerance)
                        {
                            result.SignalsMatch = false;
                            result.DifferentSignalIndices.Add(i);
                        }
                    }

                    result.MaxSignalDifference = maxDiff;
                }
            }
            catch (Exception ex)
            {
                result.ErrorMessage = $"Error comparing frame: {ex.Message}";
                result.SignalsMatch = false;
            }

            return result;
        }

        static void DisplayResults(ComparisonResult result)
        {
            Console.WriteLine();
            Console.WriteLine("=== COMPARISON RESULTS ===");
            Console.WriteLine();

            // Overall result
            if (result.FilesIdentical)
            {
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("✅ FILES ARE IDENTICAL");
                Console.ResetColor();
            }
            else
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("❌ FILES ARE DIFFERENT");
                Console.ResetColor();
            }

            Console.WriteLine();

            // Summary statistics
            Console.WriteLine("Summary:");
            Console.WriteLine($"  Total frames in file 1: {result.TotalFrames1}");
            Console.WriteLine($"  Total frames in file 2: {result.TotalFrames2}");
            Console.WriteLine($"  Matching frames: {result.MatchingFrames}");
            Console.WriteLine($"  Different frames: {result.DifferentFrames}");
            Console.WriteLine($"  Tolerance used: {result.Tolerance:E}");

            // Display errors
            if (result.Errors.Count > 0)
            {
                Console.WriteLine();
                Console.WriteLine("Errors:");
                foreach (var error in result.Errors)
                {
                    Console.WriteLine($"  - {error}");
                }
            }

            // Display frame differences (limit to first 10)
            var differentFrames = result.FrameResults.Where(f => !f.TimestampMatch || !f.QualityWarningMatch || !f.SignalsMatch).Take(10).ToList();
            
            if (differentFrames.Count > 0)
            {
                Console.WriteLine();
                Console.WriteLine($"Frame differences (showing first {Math.Min(10, result.DifferentFrames)}):");
                
                foreach (var frame in differentFrames)
                {
                    Console.WriteLine($"  Frame {frame.FrameIndex}:");
                    
                    if (!frame.TimestampMatch)
                        Console.WriteLine($"    - Timestamp mismatch");
                    
                    if (!frame.QualityWarningMatch)
                        Console.WriteLine($"    - Quality warning mismatch");
                    
                    if (!frame.SignalsMatch)
                    {
                        Console.WriteLine($"    - Signal mismatch (max diff: {frame.MaxSignalDifference:E})");
                        if (frame.DifferentSignalIndices.Count > 0)
                        {
                            var indices = string.Join(", ", frame.DifferentSignalIndices.Take(5));
                            if (frame.DifferentSignalIndices.Count > 5)
                                indices += "...";
                            Console.WriteLine($"      Different signal indices: {indices}");
                        }
                    }
                    
                    if (!string.IsNullOrEmpty(frame.ErrorMessage))
                        Console.WriteLine($"    - Error: {frame.ErrorMessage}");
                }

                if (result.DifferentFrames > 10)
                {
                    Console.WriteLine($"  ... and {result.DifferentFrames - 10} more different frames");
                }
            }

            Console.WriteLine();
        }
    }
}
