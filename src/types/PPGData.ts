/**
 * Shared PPG Data Types
 * Common interfaces for PPG data handling across services
 *
 * @format
 */

import { PPGResult } from './Video2PPGConverter';

export interface PPGData {
  timestamp: string;
  rawSignals: PPGResult[];
  frameCount: number;
  processingTime: number;
  qualityWarnings: number;
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
