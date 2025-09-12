/**
 * PPGDataExportService
 * Service for formatting and exporting PPG signal data
 *
 * @format
 */

import { Platform } from 'react-native';
import { PPGResult } from '../types/Video2PPGConverter';
import { PPGData } from '../types/PPGData';

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
    additionalMetadata?: Record<string, any>
  ): PPGData {
    const timestamp = new Date().toISOString();
    
    return {
      timestamp,
      rawSignals: processingResult.rawSignals,
      frameCount: processingResult.frameCount,
      processingTime: processingResult.processingTime,
      qualityWarnings: processingResult.qualityWarnings,
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

}

// Export singleton instance
export const ppgDataExportService = new PPGDataExportService();
export type { PPGData };
