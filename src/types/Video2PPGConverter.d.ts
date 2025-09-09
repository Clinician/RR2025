declare module 'react-native' {
  interface NativeModulesStatic {
    Video2PPGConverter: Video2PPGConverterModule;
  }
}

export interface PPGResult {
  timestamp: number;
  signals: number[];
  qualityWarning: boolean;
}

export interface Video2PPGConverterModule {
  /**
   * Initializes the PPG conversion algorithm
   * @param width Image width in pixels
   * @param height Image height in pixels
   * @param phoneModel Phone model identifier
   * @returns Promise that resolves when initialization is complete
   */
  initAlgorithm(width: number, height: number, phoneModel: number): Promise<{success: boolean}>;

  /**
   * Converts video frame to PPG signal for iOS (UV channels mixed together)
   * @param timestamp Timestamp when the image was acquired (in ms)
   * @param yData Y channel pixel data (base64 string)
   * @param uvData UV channel pixel data (base64 string)
   * @returns Promise that resolves with PPG result
   */
  convertFrameiOS(timestamp: number, yData: string, uvData: string): Promise<PPGResult>;

  /**
   * Converts video frame to PPG signal for Android (U and V channels separated)
   * @param timestamp Timestamp when the image was acquired (in ms)
   * @param yData Y channel pixel data
   * @param uData U channel pixel data
   * @param vData V channel pixel data
   * @returns Promise that resolves with PPG result
   */
  convertFrameAndroid(timestamp: number, yData: ArrayBuffer, uData: ArrayBuffer, vData: ArrayBuffer): Promise<PPGResult>;
}
