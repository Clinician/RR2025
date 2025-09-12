import { NativeModules } from 'react-native';

const { VideoFrameExtractor } = NativeModules;

export interface VideoMetadata {
  width: number;
  height: number;
  frameRate: number;
  duration: number;
  totalFrames: number;
}

export interface FrameData {
  frameIndex?: number;
  yChannel: string; // Base64 encoded
  uvChannel: string; // Base64 encoded
  timestamp: number;
}

class VideoFrameExtractorService {
  /**
   * Get video metadata including dimensions, frame rate, and duration
   * @param videoPath Path to the video file
   * @returns Video metadata
   */
  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    if (!VideoFrameExtractor) {
      throw new Error('VideoFrameExtractor native module not available');
    }

    try {
      const metadata = await VideoFrameExtractor.getVideoMetadata(videoPath);
      return {
        width: metadata.width,
        height: metadata.height,
        frameRate: metadata.frameRate,
        duration: metadata.duration,
        totalFrames: metadata.totalFrames
      };
    } catch (error) {
      throw new Error(`Failed to get video metadata: ${error}`);
    }
  }

  /**
   * Extract a specific frame from video and convert to YUV format
   * @param videoPath Path to the video file
   * @param frameIndex Index of the frame to extract (0-based)
   * @param totalFrames Total number of frames in the video
   * @returns Frame data with Y and UV channels
   */
  async extractFrame(
    videoPath: string, 
    frameIndex: number, 
    totalFrames: number
  ): Promise<FrameData> {
    if (!VideoFrameExtractor) {
      throw new Error('VideoFrameExtractor native module not available');
    }

    try {
      const frameData = await VideoFrameExtractor.extractFrame(
        videoPath, 
        frameIndex, 
        totalFrames
      );
      
      return {
        yChannel: frameData.yChannel,
        uvChannel: frameData.uvChannel,
        timestamp: frameData.timestamp
      };
    } catch (error) {
      throw new Error(`Failed to extract frame ${frameIndex}: ${error}`);
    }
  }

  /**
   * Extract multiple frames from video in batch
   * @param videoPath Path to the video file
   * @param frameIndices Array of frame indices to extract
   * @param totalFrames Total number of frames in the video
   * @returns Array of frame data
   */
  async extractFrames(
    videoPath: string, 
    frameIndices: number[], 
    totalFrames: number
  ): Promise<FrameData[]> {
    if (!VideoFrameExtractor) {
      throw new Error('VideoFrameExtractor native module not available');
    }

    try {
      const framesData = await VideoFrameExtractor.extractFrames(
        videoPath, 
        frameIndices, 
        totalFrames
      );
      
      return framesData.map((frameData: any) => ({
        frameIndex: frameData.frameIndex,
        yChannel: frameData.yChannel,
        uvChannel: frameData.uvChannel,
        timestamp: frameData.timestamp
      }));
    } catch (error) {
      throw new Error(`Failed to extract frames: ${error}`);
    }
  }

  /**
   * Convert base64 encoded channel data to ArrayBuffer
   * @param base64Data Base64 encoded string
   * @returns ArrayBuffer
   */
  base64ToArrayBuffer(base64Data: string): ArrayBuffer {
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  }

  /**
   * Generate frame indices for sampling frames from video
   * @param totalFrames Total number of frames in video
   * @param maxFrames Maximum number of frames to extract (ignored - now returns all frames)
   * @returns Array of frame indices
   */
  generateFrameIndices(totalFrames: number, maxFrames: number = 100): number[] {
    // Always extract all frames for better PPG signal quality
    return Array.from({ length: totalFrames }, (_, i) => i);
  }
}

export const videoFrameExtractorService = new VideoFrameExtractorService();
