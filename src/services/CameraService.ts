import { Camera, CameraDevice, VideoFile } from 'react-native-vision-camera';
import { Platform } from 'react-native';

export interface VideoRecordingResult {
  path: string;
  duration: number;
}

export class CameraService {
  private camera: Camera | null = null;
  private device: CameraDevice | null = null;
  private isRecording = false;
  private isFlashlightOn = false;
  private recordingPromise: Promise<VideoRecordingResult> | null = null;
  private recordingResolve: ((result: VideoRecordingResult) => void) | null = null;
  private recordingReject: ((error: Error) => void) | null = null;

  /**
   * Initialize camera service and request permissions
   */
  async initialize(): Promise<boolean> {
    try {
      // Request camera permission only (no microphone needed for silent video)
      const cameraPermission = await Camera.requestCameraPermission();
      console.log("Camera permission: ", cameraPermission);
      
      if (cameraPermission !== 'granted') {
        console.error('Camera permission denied');
        return false;
      }

      // Get back camera device
      const devices = Camera.getAvailableCameraDevices();
      this.device = devices.find(device => device.position === 'back') || null;
      
      if (!this.device) {
        console.error('No back camera found');
        return false;
      }

      console.log('Camera service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize camera service:', error);
      return false;
    }
  }

  /**
   * Set camera reference for controlling flashlight and recording
   */
  setCameraRef(cameraRef: Camera | null) {
    this.camera = cameraRef;
  }

  /**
   * Turn on the flashlight at maximum brightness
   */
  async turnOnFlashlight(): Promise<boolean> {
    try {
      if (!this.camera) {
        console.error('Camera reference not set');
        return false;
      }

      // Set flashlight to maximum brightness
      // The torch will be controlled via the Camera component's torch prop
      // and the flash: 'on' setting in recording ensures maximum brightness
      this.isFlashlightOn = true;
      console.log('Flashlight turned on at maximum brightness');
      return true;
    } catch (error) {
      console.error('Failed to turn on flashlight:', error);
      return false;
    }
  }

  /**
   * Turn off the flashlight
   */
  async turnOffFlashlight(): Promise<boolean> {
    try {
      this.isFlashlightOn = false;
      console.log('Flashlight turned off');
      return true;
    } catch (error) {
      console.error('Failed to turn off flashlight:', error);
      return false;
    }
  }

  /**
   * Start video recording
   */
  async startRecording(): Promise<boolean> {
    try {
      if (!this.camera) {
        console.error('Camera reference not set');
        return false;
      }

      if (this.isRecording) {
        console.warn('Recording already in progress');
        return false;
      }

      // Create a promise to track the recording result
      this.recordingPromise = new Promise<VideoRecordingResult>((resolve, reject) => {
        this.recordingResolve = resolve;
        this.recordingReject = reject;
      });

      this.camera.startRecording({
        flash: 'on',
        videoCodec: 'h264',
        onRecordingFinished: (video: VideoFile) => {
          console.log('Recording finished:', video.path);
          if (this.recordingResolve) {
            this.recordingResolve({
              path: video.path,
              duration: video.duration,
            });
          }
          this.isRecording = false;
          this.recordingPromise = null;
          this.recordingResolve = null;
          this.recordingReject = null;
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error);
          if (this.recordingReject) {
            this.recordingReject(new Error(`Recording failed: ${error.message}`));
          }
          this.isRecording = false;
          this.recordingPromise = null;
          this.recordingResolve = null;
          this.recordingReject = null;
        },
      });

      this.isRecording = true;
      console.log('Video recording started');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  /**
   * Stop video recording
   */
  async stopRecording(): Promise<VideoRecordingResult | null> {
    try {
      if (!this.camera || !this.isRecording) {
        console.log('No active recording to stop');
        return null;
      }

      if (!this.recordingPromise) {
        console.log('No recording promise found');
        return null;
      }

      // Stop the recording
      this.camera.stopRecording();
      console.log('Video recording stop requested');
      
      // Wait for the recording to complete and return the actual video file
      const result = await this.recordingPromise;
      console.log('Video recording completed with result:', result);
      
      return result;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.isRecording = false;
      this.recordingPromise = null;
      this.recordingResolve = null;
      this.recordingReject = null;
      return null;
    }
  }

  /**
   * Get the camera device for rendering
   */
  getDevice(): CameraDevice | null {
    return this.device;
  }

  /**
   * Check if flashlight is currently on
   */
  get flashlightOn(): boolean {
    return this.isFlashlightOn;
  }

  /**
   * Check if currently recording
   */
  get recording(): boolean {
    return this.isRecording;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.camera = null;
    this.device = null;
    this.isRecording = false;
    this.isFlashlightOn = false;
  }
}

// Export singleton instance
export const cameraService = new CameraService();
