using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Linq;

namespace CamPPG
{
    /// <summary>
    /// Video frame data structure for loading from file
    /// </summary>
    public struct VideoFrame
    {
        public ulong Timestamp { get; set; }
        public int[] YData { get; set; }
        public int[] UVData { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
    }

    /// <summary>
    /// Video data container for JSON serialization
    /// </summary>
    public class VideoData
    {
        public int Width { get; set; }
        public int Height { get; set; }
        public int PhoneModel { get; set; }
        public List<VideoFrame> Frames { get; set; } = new List<VideoFrame>();
    }

    /// <summary>
    /// Serializable PPG result structure
    /// </summary>
    public class SerializablePpgResult
    {
        public ulong Timestamp { get; set; }
        public double[]? Signals { get; set; }
        public bool QualityWarning { get; set; }
    }

    /// <summary>
    /// PPG processing results for output
    /// </summary>
    public class PPGResults
    {
        public List<SerializablePpgResult> PPGSignals { get; set; } = new List<SerializablePpgResult>();
        public int TotalFrames { get; set; }
        public int QualityWarnings { get; set; }
        public double ProcessingTimeMs { get; set; }
        public DateTime ProcessedAt { get; set; }
    }

    /// <summary>
    /// Console application to run iOS PPG converter on video data from file
    /// </summary>
    class PPGConverterRunner
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== iOS PPG Converter Runner ===");
            Console.WriteLine();

            string inputFile = args[0];
            string outputFile = args.Length > 1 ? args[1] : "ppg_results.json";

            try
            {
                // Load video data from file
                Console.WriteLine($"Loading video data from: {inputFile}");
                VideoData videoData = LoadVideoData(inputFile);
                
                if (videoData.Frames.Count == 0)
                {
                    Console.WriteLine("Error: No frames found in input file");
                    return;
                }

                Console.WriteLine($"Loaded {videoData.Frames.Count} frames");
                Console.WriteLine($"Resolution: {videoData.Width}x{videoData.Height}");
                Console.WriteLine($"Phone Model: {videoData.PhoneModel}");
                Console.WriteLine();

                // Process frames with PPG converter
                Console.WriteLine("Processing frames with iOS PPG converter...");
                PPGResults results = ProcessFrames(videoData);

                // Save results
                Console.WriteLine($"Saving results to: {outputFile}");
                SaveResults(results, outputFile);

                // Display summary
                DisplaySummary(results);

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
            }
        }

        static VideoData LoadVideoData(string filePath)
        {
            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException($"Input file not found: {filePath}");
            }

            string jsonContent = File.ReadAllText(filePath);
            
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                
                VideoData? videoData = JsonSerializer.Deserialize<VideoData>(jsonContent, options);
                
                if (videoData == null)
                {
                    throw new InvalidDataException("Failed to deserialize video data");
                }

                return videoData;
            }
            catch (JsonException ex)
            {
                throw new InvalidDataException($"Invalid JSON format: {ex.Message}");
            }
        }

        static PPGResults ProcessFrames(VideoData videoData)
        {
            var converter = new Video2PPGConverter();
            converter.InitAlgo(videoData.Width, videoData.Height, videoData.PhoneModel);

            var results = new PPGResults
            {
                TotalFrames = videoData.Frames.Count,
                ProcessedAt = DateTime.Now
            };

            var startTime = DateTime.Now;
            int qualityWarnings = 0;

            Console.WriteLine("Processing frames:");
            for (int i = 0; i < videoData.Frames.Count; i++)
            {
                var frame = videoData.Frames[i];
                
                // Show progress
                if (i % 10 == 0 || i == videoData.Frames.Count - 1)
                {
                    double progress = (double)(i + 1) / videoData.Frames.Count * 100;
                    Console.Write($"\rProgress: {progress:F1}% ({i + 1}/{videoData.Frames.Count})");
                }

                // Validate frame data
                if (frame.YData == null || frame.UVData == null)
                {
                    Console.WriteLine($"\nWarning: Frame {i} has null data, skipping");
                    continue;
                }

                int expectedYSize = frame.Width * frame.Height;
                if (frame.YData.Length != expectedYSize)
                {
                    Console.WriteLine($"\nWarning: Frame {i} Y data size mismatch. Expected: {expectedYSize}, Got: {frame.YData.Length}");
                    continue;
                }

                try
                {
                    // Convert int arrays to byte arrays
                    byte[] yDataBytes = frame.YData.Select(x => (byte)Math.Max(0, Math.Min(255, x))).ToArray();
                    byte[] uvDataBytes = frame.UVData.Select(x => (byte)Math.Max(0, Math.Min(255, x))).ToArray();

                    // Process frame with iOS converter
                    converter.ConvertFrame2PPGiOS(
                        frame.Timestamp,
                        yDataBytes,
                        uvDataBytes,
                        out Video2PPGConverter.PpgStruct ppgResult
                    );

                    // Convert to serializable format
                    var serializableResult = new SerializablePpgResult
                    {
                        Timestamp = ppgResult.timestamp,
                        Signals = ppgResult.Signals,
                        QualityWarning = ppgResult.QualityWarning
                    };
                    results.PPGSignals.Add(serializableResult);

                    if (ppgResult.QualityWarning)
                    {
                        qualityWarnings++;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"\nError processing frame {i}: {ex.Message}");
                }
            }

            var endTime = DateTime.Now;
            results.ProcessingTimeMs = (endTime - startTime).TotalMilliseconds;
            results.QualityWarnings = qualityWarnings;

            Console.WriteLine(); // New line after progress
            return results;
        }

        static void SaveResults(PPGResults results, string outputFile)
        {
            try
            {
                var options = new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };

                // Output only the PPG signals array
                string jsonOutput = JsonSerializer.Serialize(results.PPGSignals, options);
                File.WriteAllText(outputFile, jsonOutput);
            }
            catch (Exception ex)
            {
                throw new IOException($"Failed to save results: {ex.Message}");
            }
        }

        static void DisplaySummary(PPGResults results)
        {
            Console.WriteLine();
            Console.WriteLine($"Processing time: {results.ProcessingTimeMs:F2} ms");
            Console.WriteLine($"Average time per frame: {(results.ProcessingTimeMs / results.TotalFrames):F2} ms");
        }

    }
}
