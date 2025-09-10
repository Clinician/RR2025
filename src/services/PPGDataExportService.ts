/**
 * PPGDataExportService
 * Service for formatting and exporting PPG signal data
 *
 * @format
 */

import { Platform } from 'react-native';
import { PPGResult } from '../types/Video2PPGConverter';

interface PPGData {
  timestamp: string;
  rawSignals: PPGResult[];
  frameCount: number;
  processingTime: number;
  qualityWarnings: number;
  videoPath?: string;
  metadata: {
    appVersion: string;
    deviceInfo: string;
    measurementDuration: number;
    platform?: string;
    platformVersion?: string;
    [key: string]: any;
  };
  statistics?: Record<string, number>;
}

interface PPGProcessingResult {
  rawSignals: PPGResult[];
  frameCount: number;
  processingTime: number;
  qualityWarnings: number;
}

class PPGDataExportService {
  /**
   * Format PPG processing result into exportable data structure
   */
  formatPPGData(
    processingResult: PPGProcessingResult,
    videoPath?: string,
    additionalMetadata?: Record<string, any>
  ): PPGData {
    const timestamp = new Date().toISOString();
    
    return {
      timestamp,
      rawSignals: processingResult.rawSignals,
      frameCount: processingResult.frameCount,
      processingTime: processingResult.processingTime,
      qualityWarnings: processingResult.qualityWarnings,
      videoPath: videoPath || undefined,
      metadata: {
        appVersion: '1.0.0', // You might want to get this from package.json
        deviceInfo: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
        measurementDuration: 30000, // 30 seconds in milliseconds
        platform: Platform.OS,
        platformVersion: Platform.Version.toString(),
        ...additionalMetadata,
      },
    };
  }

  /**
   * Generate a default filename based on current timestamp
   */
  generateDefaultFilename(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    return `ppg_measurement_${dateStr}_${timeStr}`;
  }

  /**
   * Validate PPG data before export
   */
  validatePPGData(data: PPGData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.rawSignals || data.rawSignals.length === 0) {
      errors.push('No PPG signals found');
    }

    if (data.frameCount <= 0) {
      errors.push('Invalid frame count');
    }

    if (data.processingTime <= 0) {
      errors.push('Invalid processing time');
    }

    if (!data.timestamp) {
      errors.push('Missing timestamp');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate additional statistics for the PPG data
   */
  calculateStatistics(signals: number[]): Record<string, number> {
    if (signals.length === 0) {
      return {};
    }

    const sum = signals.reduce((acc, val) => acc + val, 0);
    const mean = sum / signals.length;
    
    const variance = signals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / signals.length;
    const standardDeviation = Math.sqrt(variance);
    
    const min = Math.min(...signals);
    const max = Math.max(...signals);
    
    return {
      mean,
      standardDeviation,
      variance,
      min,
      max,
      range: max - min,
      signalCount: signals.length,
    };
  }

  /**
   * Enhance PPG data with additional statistics
   */
  enhancePPGData(data: PPGData): PPGData {
    // Calculate statistics from all raw signals combined
    const allSignalValues = data.rawSignals.map(signal => signal.signals).flat();
    const statistics = this.calculateStatistics(allSignalValues);
    
    return {
      ...data,
      statistics: {
        ...statistics,
        totalFrames: data.rawSignals.length,
        signalsPerFrame: data.rawSignals.length > 0 ? data.rawSignals[0].signals.length : 0,
      },
    };
  }
}

// Export singleton instance
export const ppgDataExportService = new PPGDataExportService();
