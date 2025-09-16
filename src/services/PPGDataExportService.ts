/**
 * PPGDataExportService
 * Service for formatting and exporting PPG signal data
 *
 * @format
 */

import { Platform } from 'react-native';
import { PPGResult } from '../types/Video2PPGConverter';
import { PPGData, PPGStatistics } from '../types/PPGData';

interface PPGProcessingResult {
  rawSignals: PPGResult[];
  frameCount: number;
  processingTime: number;
  qualityWarnings: number;
}

class PPGDataExportService {
  /**
   * Calculate comprehensive statistics for PPG signals
   */
  private calculatePPGStatistics(signals: PPGResult[]): PPGStatistics {
    if (signals.length === 0) {
      return {
        totalFrames: 0,
        validFrames: 0,
        qualityWarningFrames: 0,
        qualityScore: 0,
        signalStatistics: {
          mean: 0,
          standardDeviation: 0,
          minimum: 0,
          maximum: 0,
          range: 0,
          variance: 0
        },
        temporalStatistics: {
          averageTimestamp: 0,
          timestampRange: 0,
          samplingRate: 0,
          duration: 0
        },
        signalQuality: {
          signalToNoiseRatio: 0,
          peakToPeakAmplitude: 0,
          rmsAmplitude: 0,
          zeroCrossings: 0
        },
        heartRateEstimation: {
          estimatedBPM: 0,
          confidence: 0,
          peakCount: 0,
          rhythmRegularity: 0
        }
      };
    }

    const totalFrames = signals.length;
    const qualityWarningFrames = signals.filter(s => s.qualityWarning).length;
    const validFrames = totalFrames - qualityWarningFrames;
    const qualityScore = validFrames / totalFrames;

    // Flatten all signal values for analysis
    const allSignalValues: number[] = [];
    signals.forEach(signal => {
      allSignalValues.push(...signal.signals);
    });

    // Basic signal statistics
    const mean = allSignalValues.reduce((sum, val) => sum + val, 0) / allSignalValues.length;
    const variance = allSignalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allSignalValues.length;
    const standardDeviation = Math.sqrt(variance);
    const minimum = Math.min(...allSignalValues);
    const maximum = Math.max(...allSignalValues);
    const range = maximum - minimum;

    // Temporal statistics
    const timestamps = signals.map(s => s.timestamp);
    const averageTimestamp = timestamps.reduce((sum, ts) => sum + ts, 0) / timestamps.length;
    const timestampRange = Math.max(...timestamps) - Math.min(...timestamps);
    const duration = timestampRange; // in milliseconds
    const samplingRate = totalFrames / (duration / 1000); // frames per second

    // Signal quality metrics
    const rmsAmplitude = Math.sqrt(allSignalValues.reduce((sum, val) => sum + val * val, 0) / allSignalValues.length);
    const peakToPeakAmplitude = maximum - minimum;
    
    // Simple SNR estimation (signal power vs noise power)
    const signalPower = mean * mean;
    const noisePower = variance;
    const signalToNoiseRatio = signalPower > 0 ? 10 * Math.log10(signalPower / noisePower) : 0;

    // Zero crossings (approximate)
    let zeroCrossings = 0;
    for (let i = 1; i < allSignalValues.length; i++) {
      if ((allSignalValues[i] >= mean && allSignalValues[i-1] < mean) || 
          (allSignalValues[i] < mean && allSignalValues[i-1] >= mean)) {
        zeroCrossings++;
      }
    }

    // Heart rate estimation (simplified peak detection)
    const { estimatedBPM, confidence, peakCount, rhythmRegularity } = this.estimateHeartRate(signals, samplingRate);

    return {
      totalFrames,
      validFrames,
      qualityWarningFrames,
      qualityScore,
      signalStatistics: {
        mean,
        standardDeviation,
        minimum,
        maximum,
        range,
        variance
      },
      temporalStatistics: {
        averageTimestamp,
        timestampRange,
        samplingRate,
        duration
      },
      signalQuality: {
        signalToNoiseRatio,
        peakToPeakAmplitude,
        rmsAmplitude,
        zeroCrossings
      },
      heartRateEstimation: {
        estimatedBPM,
        confidence,
        peakCount,
        rhythmRegularity
      }
    };
  }

  /**
   * Estimate heart rate from PPG signals
   */
  private estimateHeartRate(signals: PPGResult[], samplingRate: number): {
    estimatedBPM: number;
    confidence: number;
    peakCount: number;
    rhythmRegularity: number;
  } {
    if (signals.length === 0 || samplingRate <= 0) {
      return { estimatedBPM: 0, confidence: 0, peakCount: 0, rhythmRegularity: 0 };
    }

    // Combine all signals into a single time series
    const combinedSignals: number[] = [];
    signals.forEach(signal => {
      // Take the average of all signals in each frame
      const frameAverage = signal.signals.reduce((sum, val) => sum + val, 0) / signal.signals.length;
      combinedSignals.push(frameAverage);
    });

    // Simple peak detection
    const peaks: number[] = [];
    const windowSize = Math.max(3, Math.floor(samplingRate * 0.3)); // 300ms window
    
    for (let i = windowSize; i < combinedSignals.length - windowSize; i++) {
      let isPeak = true;
      const currentValue = combinedSignals[i];
      
      // Check if current point is higher than surrounding points
      for (let j = i - windowSize; j <= i + windowSize; j++) {
        if (j !== i && combinedSignals[j] >= currentValue) {
          isPeak = false;
          break;
        }
      }
      
      if (isPeak) {
        peaks.push(i);
      }
    }

    const peakCount = peaks.length;
    
    if (peakCount < 2) {
      return { estimatedBPM: 0, confidence: 0, peakCount, rhythmRegularity: 0 };
    }

    // Calculate intervals between peaks
    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      const intervalFrames = peaks[i] - peaks[i-1];
      const intervalSeconds = intervalFrames / samplingRate;
      intervals.push(intervalSeconds);
    }

    // Calculate average heart rate
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const estimatedBPM = 60 / averageInterval;

    // Calculate rhythm regularity (coefficient of variation)
    const intervalMean = averageInterval;
    const intervalVariance = intervals.reduce((sum, interval) => sum + Math.pow(interval - intervalMean, 2), 0) / intervals.length;
    const intervalStd = Math.sqrt(intervalVariance);
    const rhythmRegularity = intervalMean > 0 ? 1 - (intervalStd / intervalMean) : 0;

    // Confidence based on number of peaks and regularity
    const confidence = Math.min(1, (peakCount / 10) * rhythmRegularity);

    return {
      estimatedBPM: Math.round(estimatedBPM),
      confidence: Math.round(confidence * 100) / 100,
      peakCount,
      rhythmRegularity: Math.round(rhythmRegularity * 100) / 100
    };
  }

  /**
   * Format PPG processing result into exportable data structure
   */
  formatPPGData(
    processingResult: PPGProcessingResult,
    additionalMetadata?: Record<string, any>
  ): PPGData {
    const timestamp = new Date().toISOString();
    const statistics = this.calculatePPGStatistics(processingResult.rawSignals);
    
    return {
      timestamp,
      rawSignals: processingResult.rawSignals,
      frameCount: processingResult.frameCount,
      processingTime: processingResult.processingTime,
      qualityWarnings: processingResult.qualityWarnings,
      statistics,
      metadata: {
        appVersion: '1.0.0', // You might want to get this from package.json
        deviceInfo: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
        measurementDuration: statistics.temporalStatistics.duration,
        platform: Platform.OS,
        platformVersion: Platform.Version.toString(),
        ...additionalMetadata,
      },
    };
  }

  /**
   * Generate a summary of PPG statistics for display
   */
  generateStatisticsSummary(statistics: PPGStatistics): string {
    const qualityPercentage = Math.round(statistics.qualityScore * 100);
    const duration = Math.round(statistics.temporalStatistics.duration / 1000);
    const samplingRate = Math.round(statistics.temporalStatistics.samplingRate);
    
    return `PPG Analysis Summary:
` +
           `• Duration: ${duration}s (${statistics.totalFrames} frames)
` +
           `• Sampling Rate: ${samplingRate} fps
` +
           `• Signal Quality: ${qualityPercentage}% (${statistics.validFrames}/${statistics.totalFrames} valid frames)
` +
           `• Heart Rate: ${statistics.heartRateEstimation.estimatedBPM} BPM (${Math.round(statistics.heartRateEstimation.confidence * 100)}% confidence)
` +
           `• Signal Range: ${statistics.signalStatistics.minimum.toFixed(2)} - ${statistics.signalStatistics.maximum.toFixed(2)}
` +
           `• SNR: ${statistics.signalQuality.signalToNoiseRatio.toFixed(1)} dB`;
  }

}

// Export singleton instance
export const ppgDataExportService = new PPGDataExportService();
export type { PPGData };
