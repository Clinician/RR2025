/**
 * FileShareService
 * Service for sharing PPG data files using document picker
 *
 * @format
 */

import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { PPGData, ShareResult, UploadResult } from '../types/PPGData';
import { documentPickerService } from './DocumentPickerService';

class FileShareService {
  private readonly localStoragePath: string;

  constructor() {
    // Use app's Documents directory for local storage fallback
    this.localStoragePath = `${RNFS.DocumentDirectoryPath}/Riva_PPG`;
  }

  /**
   * Share PPG data using document picker (allows user to choose save location)
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
        sharedViaDocumentPicker: true,
      };

      const jsonString = JSON.stringify(jsonData, null, 2);

      // Log PPG data details
      console.log('PPG data prepared for sharing:', {
        filename: `${filename}.json`,
        size: jsonString.length
      });

      console.log('=== PPG DATA SHARING SUMMARY ===');
      console.log('Share Time:', new Date().toISOString());
      console.log('Filename:', `${filename}.json`);
      console.log('Data Size:', jsonString.length, 'bytes');
      console.log('Signal Count:', ppgData.rawSignals.length);
      console.log('Frame Count:', ppgData.frameCount);
      console.log('Processing Time:', ppgData.processingTime, 'ms');
      console.log('Quality Warnings:', ppgData.qualityWarnings);
      console.log('=== END SHARING ===');

      // Use document picker to let user choose save location
      const pickerResult = await documentPickerService.saveFileWithPicker(filename, jsonString);
      
      if (pickerResult.success) {
        console.log('File saved via document picker:', pickerResult.filePath);
        return {
          success: true,
          filePath: pickerResult.filePath,
        };
      } else if (pickerResult.error === 'User cancelled file save') {
        // User cancelled - this is not an error, just return success: false
        return { success: false, error: 'User cancelled' };
      } else {
        // Fallback to local save if document picker fails
        console.warn('Document picker failed, falling back to local save:', pickerResult.error);
        return await this.savePPGDataLocally(filename, ppgData);
      }

    } catch (error) {
      console.error('Failed to share PPG data:', error);
      
      // Handle specific errors
      let errorMessage = 'An error occurred while sharing your PPG data.';
      
      if (error instanceof Error) {
        errorMessage = `Share failed: ${error.message}`;
      }

      Alert.alert(
        'Share Failed',
        `${errorMessage}\n\nPlease try again.`,
        [{ text: 'OK' }]
      );
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Save PPG data to local device storage (fallback option)
   */
  async savePPGDataLocally(filename: string, ppgData: PPGData): Promise<UploadResult> {
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
        savedLocally: true,
      };

      const jsonString = JSON.stringify(jsonData, null, 2);

      // Ensure local folder exists
      await this.ensureLocalFolderExists();

      // Create file path in app documents directory
      const filePath = `${this.localStoragePath}/${filename}.json`;

      // Write JSON data to file
      await RNFS.writeFile(filePath, jsonString, 'utf8');
      
      console.log('PPG data saved locally at:', filePath);
      console.log('Data size:', jsonString.length, 'bytes');

      Alert.alert(
        'Saved Locally',
        `Your PPG data has been saved to the app folder.\n\nFile: ${filename}.json\nSize: ${Math.round(jsonString.length / 1024)}KB\n\nYou can access this file through the Files app.`,
        [{ text: 'OK' }]
      );

      return { success: true, filePath };

    } catch (error) {
      console.error('Failed to save PPG data locally:', error);
      Alert.alert(
        'Save Failed',
        `Failed to save PPG data locally: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Ensure the local storage folder exists
   */
  private async ensureLocalFolderExists(): Promise<void> {
    try {
      const folderExists = await RNFS.exists(this.localStoragePath);
      if (!folderExists) {
        await RNFS.mkdir(this.localStoragePath);
        console.log('Created local storage folder:', this.localStoragePath);
      }
    } catch (error) {
      console.error('Failed to create local storage folder:', error);
      throw new Error(`Could not create local storage folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if document picker is available
   */
  async isDocumentPickerAvailable(): Promise<boolean> {
    return documentPickerService.isAvailable();
  }

  /**
   * Get the local storage folder path
   */
  getLocalStoragePath(): string {
    return this.localStoragePath;
  }
}

// Export singleton instance
export const fileShareService = new FileShareService();
