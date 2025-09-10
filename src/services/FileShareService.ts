/**
 * FileShareService
 * Service for sharing PPG data files using native device sharing capabilities
 *
 * @format
 */

import { Alert, Platform } from 'react-native';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

interface PPGData {
  timestamp: string;
  rawSignals: number[][];
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

interface ShareResult {
  success: boolean;
  activityType?: string;
  error?: string;
}

class FileShareService {
  /**
   * Save PPG data as JSON file and share it
   */
  async sharePPGData(filename: string, ppgData: PPGData): Promise<ShareResult> {
    try {
      // Validate filename
      if (!filename || filename.trim().length === 0) {
        console.error('Invalid filename provided');
        Alert.alert(
          'Invalid Filename',
          'Please provide a valid filename for your PPG data.',
          [{ text: 'OK' }]
        );
        return { success: false, error: 'Invalid filename' };
      }

      // Validate PPG data
      if (!ppgData || !ppgData.rawSignals || ppgData.rawSignals.length === 0) {
        console.error('Invalid PPG data provided');
        Alert.alert(
          'No Data to Share',
          'No valid PPG signal data found to share. Please try measuring again.',
          [{ text: 'OK' }]
        );
        return { success: false, error: 'Invalid PPG data' };
      }

      // Prepare the JSON data with additional metadata
      const jsonData = {
        ...ppgData,
        exportedAt: new Date().toISOString(),
        filename: filename,
        fileVersion: '1.0',
        dataIntegrity: {
          signalCount: ppgData.rawSignals.length,
          checksumMD5: this.calculateSimpleChecksum(ppgData.rawSignals.flat()),
        },
      };

      const jsonString = JSON.stringify(jsonData, null, 2);

      // Create temporary file path
      const documentsPath = RNFS.DocumentDirectoryPath;
      const filePath = `${documentsPath}/${filename}.json`;

      // Write JSON data to file
      await RNFS.writeFile(filePath, jsonString, 'utf8');
      console.log('PPG data file created at:', filePath);

      // Verify file exists before sharing
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        throw new Error('Failed to create file for sharing');
      }

      // Get file stats for additional info
      const fileStats = await RNFS.stat(filePath);
      console.log('File created successfully:', {
        path: filePath,
        size: fileStats.size,
        exists: fileExists
      });

      // Prepare share options with proper file URL
      const shareOptions = {
        title: 'Share PPG Measurement Data',
        message: `PPG measurement data from ${new Date().toLocaleDateString()}\n\nFile: ${filename}.json\nSize: ${Math.round(fileStats.size / 1024)}KB`,
        url: `file://${filePath}`,
        type: 'application/json',
        filename: `${filename}.json`,
        subject: `PPG Data - ${filename}`,
        // Additional options for better compatibility
        saveToFiles: true, // iOS Files app
        showAppsToView: true,
        isNewTask: true,
      };

      // Show native share dialog
      const result = await Share.open(shareOptions);
      
      console.log('=== PPG DATA SHARE SUMMARY ===');
      console.log('Share Time:', new Date().toISOString());
      console.log('Filename:', `${filename}.json`);
      console.log('File Path:', filePath);
      console.log('Data Size:', jsonString.length, 'bytes');
      console.log('Signal Count:', ppgData.rawSignals.length);
      console.log('Frame Count:', ppgData.frameCount);
      console.log('Processing Time:', ppgData.processingTime, 'ms');
      console.log('Quality Warnings:', ppgData.qualityWarnings);
      if (ppgData.statistics) {
        console.log('Signal Statistics:', ppgData.statistics);
      }
      console.log('Share Result:', result);
      console.log('=== END SHARE ===');

      // Clean up temporary file after sharing
      setTimeout(async () => {
        try {
          await RNFS.unlink(filePath);
          console.log('Temporary file cleaned up:', filePath);
        } catch (error) {
          console.log('Could not clean up temporary file:', error);
        }
      }, 5000); // Clean up after 5 seconds

      return {
        success: true,
        activityType: typeof result === 'object' && result !== null ? 'shared' : 'unknown',
      };

    } catch (error) {
      console.error('Failed to share PPG data:', error);
      
      // Handle user cancellation gracefully
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('User did not share') || errorMessage.includes('cancelled')) {
          return { success: false, error: 'User cancelled sharing' };
        }
      }

      Alert.alert(
        'Share Failed',
        `An error occurred while sharing your PPG data:\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`,
        [{ text: 'OK' }]
      );
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Save PPG data to device storage without sharing
   */
  async savePPGDataLocally(filename: string, ppgData: PPGData): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // Validate inputs
      if (!filename || filename.trim().length === 0) {
        return { success: false, error: 'Invalid filename' };
      }

      if (!ppgData || !ppgData.rawSignals || ppgData.rawSignals.length === 0) {
        return { success: false, error: 'Invalid PPG data' };
      }

      // Prepare the JSON data
      const jsonData = {
        ...ppgData,
        exportedAt: new Date().toISOString(),
        filename: filename,
        fileVersion: '1.0',
        dataIntegrity: {
          signalCount: ppgData.rawSignals.length,
          checksumMD5: this.calculateSimpleChecksum(ppgData.rawSignals.flat()),
        },
      };

      const jsonString = JSON.stringify(jsonData, null, 2);

      // Create file path in documents directory
      const documentsPath = RNFS.DocumentDirectoryPath;
      const filePath = `${documentsPath}/${filename}.json`;

      // Write JSON data to file
      await RNFS.writeFile(filePath, jsonString, 'utf8');
      
      console.log('PPG data saved locally at:', filePath);
      console.log('Data size:', jsonString.length, 'bytes');

      return { success: true, filePath };

    } catch (error) {
      console.error('Failed to save PPG data locally:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Calculate a simple checksum for data integrity verification
   */
  private calculateSimpleChecksum(signals: number[]): string {
    const sum = signals.reduce((acc, val) => acc + val, 0);
    const avg = sum / signals.length;
    return Math.round(avg * 1000000).toString(16);
  }

  /**
   * Get list of available sharing options
   */
  async getAvailableShareOptions(): Promise<string[]> {
    try {
      // This would return available sharing apps, but react-native-share
      // handles this automatically in the native share dialog
      return ['Native Share Dialog'];
    } catch (error) {
      console.error('Failed to get share options:', error);
      return [];
    }
  }

  /**
   * Check if sharing is available on the device
   */
  async isShareAvailable(): Promise<boolean> {
    try {
      // react-native-share is available on both iOS and Android
      return true;
    } catch (error) {
      console.error('Share not available:', error);
      return false;
    }
  }
}

// Export singleton instance
export const fileShareService = new FileShareService();
export type { PPGData, ShareResult };
