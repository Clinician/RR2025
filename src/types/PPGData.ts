/**
 * Shared PPG Data Types
 * Common interfaces for PPG data handling across services
 *
 * @format
 */

import { PPGResult } from './Video2PPGConverter';

export interface PPGStatistics {
  totalFrames: number;
  validFrames: number;
  qualityWarningFrames: number;
  qualityScore: number;
  signalStatistics: {
    mean: number;
    standardDeviation: number;
    minimum: number;
    maximum: number;
    range: number;
    variance: number;
  };
  temporalStatistics: {
    averageTimestamp: number;
    timestampRange: number;
    samplingRate: number;
    duration: number;
  };
  signalQuality: {
    signalToNoiseRatio: number;
    peakToPeakAmplitude: number;
    rmsAmplitude: number;
    zeroCrossings: number;
  };
  heartRateEstimation: {
    estimatedBPM: number;
    confidence: number;
    peakCount: number;
    rhythmRegularity: number;
  };
}

export interface PPGData {
  timestamp: string;
  rawSignals: PPGResult[];
  frameCount: number;
  processingTime: number;
  qualityWarnings: number;
  statistics: PPGStatistics;
  metadata: {
    appVersion: string;
    deviceInfo: string;
    measurementDuration: number;
    platform?: string;
    platformVersion?: string;
    [key: string]: any;
  };
}

export interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export interface ShareResult {
  success: boolean;
  filePath?: string;
  error?: string;
}
