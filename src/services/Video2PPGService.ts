import { NativeModules, Platform } from 'react-native';
import type { PPGResult, Video2PPGConverterModule } from '../types/Video2PPGConverter';

const { Video2PPGConverter } = NativeModules as { Video2PPGConverter: Video2PPGConverterModule };

export class Video2PPGService {
  private isInitialized = false;
  private width = 0;
  private height = 0;
  private phoneModel = 0;

  /**
   * Initialize the PPG conversion algorithm
   * @param width Image width in pixels
   * @param height Image height in pixels
   * @param phoneModel Phone model identifier (optional, defaults to 0)
   */
  async initialize(width: number, height: number, phoneModel: number = 0): Promise<void> {
    try {
      await Video2PPGConverter.initAlgorithm(width, height, phoneModel);
      this.width = width;
      this.height = height;
      this.phoneModel = phoneModel;
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize Video2PPGConverter: ${error}`);
    }
  }

  /**
   * Convert video frame to PPG signal
   * @param timestamp Timestamp when the image was acquired (in ms)
   * @param yData Y channel pixel data (base64 string for iOS)
   * @param uvData UV channel pixel data (base64 string for iOS)
   * @returns PPG result with signals and quality warning
   */
  async convertFrame(
    timestamp: number,
    yData: string,
    uvData: string,
  ): Promise<PPGResult> {
    if (!this.isInitialized) {
      throw new Error('Video2PPGConverter not initialized. Call initialize() first.');
    }

    try {
      if (Platform.OS === 'ios') {
        return await Video2PPGConverter.convertFrameiOS(timestamp, yData, uvData);
      } else {
        throw new Error('Invalid platform.');
      }
    } catch (error) {
      throw new Error(`Failed to convert frame to PPG: ${error}`);
    }
  }

  /**
   * Convert video frame to PPG signal specifically for iOS
   * @param timestamp Timestamp when the image was acquired (in ms)
   * @param yData Y channel pixel data (base64 string)
   * @param uvData UV channel pixel data (base64 string, mixed U and V)
   * @returns PPG result with signals and quality warning
   */
  async convertFrameiOS(
    timestamp: number,
    yData: string,
    uvData: string
  ): Promise<PPGResult> {
    if (!this.isInitialized) {
      throw new Error('Video2PPGConverter not initialized. Call initialize() first.');
    }

    try {
      return await Video2PPGConverter.convertFrameiOS(timestamp, yData, uvData);
    } catch (error) {
      throw new Error(`Failed to convert iOS frame to PPG: ${error}`);
    }
  }

  /**
   * Check if the service is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current configuration
   */
  getConfiguration() {
    return {
      width: this.width,
      height: this.height,
      phoneModel: this.phoneModel,
      initialized: this.isInitialized,
    };
  }
}

// Export a singleton instance
export const video2PPGService = new Video2PPGService();
