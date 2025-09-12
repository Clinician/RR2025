/**
 * DocumentPickerService
 * React Native bridge for iOS UIDocumentPickerViewController
 *
 * @format
 */

import { NativeModules, Platform } from 'react-native';

interface DocumentPickerModule {
  saveFileToiCloudDrive(filename: string, content: string): Promise<{
    success: boolean;
    filePath?: string;
    message?: string;
  }>;
}

const { DocumentPickerModule } = NativeModules;

class DocumentPickerService {
  /**
   * Save file using iOS document picker (allows user to choose location including iCloud Drive)
   */
  async saveFileWithPicker(filename: string, content: string): Promise<{
    success: boolean;
    filePath?: string;
    message?: string;
    error?: string;
  }> {
    try {
      if (Platform.OS !== 'ios') {
        return {
          success: false,
          error: 'Document picker is only available on iOS'
        };
      }

      if (!DocumentPickerModule) {
        return {
          success: false,
          error: 'Document picker module not available'
        };
      }

      const result = await DocumentPickerModule.saveFileToiCloudDrive(filename, content);
      return result;

    } catch (error) {
      console.error('Document picker error:', error);
      
      if (error && typeof error === 'object' && 'code' in error) {
        const errorObj = error as { code: string; message: string };
        if (errorObj.code === 'USER_CANCELLED') {
          return {
            success: false,
            error: 'User cancelled file save'
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check if document picker is available
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' && !!DocumentPickerModule;
  }
}

// Export singleton instance
export const documentPickerService = new DocumentPickerService();
