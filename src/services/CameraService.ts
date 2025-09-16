import { Camera, CameraDevice, VideoFile, CameraDeviceFormat } from 'react-native-vision-camera';
import { Platform } from 'react-native';

export interface VideoRecordingResult {
  path: string;
  duration: number;
}

export class CameraService {
  private camera: Camera | null = null;
  private device: CameraDevice | null = null;
  private format: CameraDeviceFormat | null = null;
  private isRecording = false;
  private isFlashlightOn = false;
  private isInitialized = false;
  private recordingPromise: Promise<VideoRecordingResult> | null = null;
  private recordingResolve: ((result: VideoRecordingResult) => void) | null = null;
  private recordingReject: ((error: Error) => void) | null = null;

  /**
   * Get optimal camera format for PPG recording with precise frame rate control
   */
  private getOptimalCameraFormat(device: CameraDevice, targetFrameRate: number = 60) {
    try {
      // Get all available formats for the device
      const formats = device.formats;
      console.log(`Available formats for device ${device.id}:`, formats.length);

      // Filter formats that can support our target frame rate exactly
      // This replicates the C# logic of setting ActiveVideoMinFrameDuration = ActiveVideoMaxFrameDuration
      const compatibleFormats = formats.filter(format => {
        const hasVideoSupport = format.videoWidth && format.videoHeight;
        const supportsTargetFps = format.minFps <= targetFrameRate && format.maxFps >= targetFrameRate;
        
        return hasVideoSupport && supportsTargetFps;
      });

      if (compatibleFormats.length === 0) {
        console.warn(`No formats support exactly ${targetFrameRate}fps, falling back to any video format`);
        const fallbackFormats = formats.filter(f => f.videoWidth && f.videoHeight);
        if (fallbackFormats.length === 0) {
          console.warn('No suitable video formats found, using default');
          return null;
        }
        return fallbackFormats[0];
      }

      // Sort by preference: exact frame rate match, then reasonable resolution
      const sortedFormats = compatibleFormats.sort((a, b) => {
        // Prefer formats where target FPS is closer to the middle of min/max range
        // This ensures better stability (similar to C# CMTime precision)
        const aFpsRange = a.maxFps - a.minFps;
        const bFpsRange = b.maxFps - b.minFps;
        const aFpsPosition = (targetFrameRate - a.minFps) / aFpsRange;
        const bFpsPosition = (targetFrameRate - b.minFps) / bFpsRange;
        const aFpsScore = Math.abs(0.5 - aFpsPosition); // Prefer middle of range
        const bFpsScore = Math.abs(0.5 - bFpsPosition);
        
        if (Math.abs(aFpsScore - bFpsScore) > 0.1) {
          return aFpsScore - bFpsScore;
        }
        
        // Prefer reasonable resolution 
        const aPixels = (a.videoWidth || 0) * (a.videoHeight || 0);
        const bPixels = (b.videoWidth || 0) * (b.videoHeight || 0);
        
        // Target 1080p for optimal PPG processing (matches CV420YpCbCr8BiPlanarFullRange preference)
        const targetPixels = 1920 * 1080;
        const aDiff = Math.abs(aPixels - targetPixels);
        const bDiff = Math.abs(bPixels - targetPixels);
        
        return aDiff - bDiff;
      });

      const selectedFormat = sortedFormats[0];
      console.log('Selected camera format with precise frame rate control:', {
        videoWidth: selectedFormat.videoWidth,
        videoHeight: selectedFormat.videoHeight,
        targetFps: targetFrameRate,
        minFps: selectedFormat.minFps,
        maxFps: selectedFormat.maxFps,
        fpsRangeSupport: `${selectedFormat.minFps}-${selectedFormat.maxFps}fps`,
        supportsVideoHdr: selectedFormat.supportsVideoHdr,
        pixelFormat: 'Will use default (similar to CV420YpCbCr8BiPlanarFullRange)'
      });

      return selectedFormat;
    } catch (error) {
      console.error('Error selecting camera format:', error);
      return null;
    }
  }

  /**
   * Initialize camera service and request permissions (but don't activate camera yet)
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

      // Get default/main back camera device (avoid ultra-wide or telephoto)
      const devices = Camera.getAvailableCameraDevices();
      console.log('Available camera devices:', devices.map(d => ({ 
        id: d.id, 
        position: d.position,
        hasFlash: d.hasFlash,
        hasTorch: d.hasTorch,
        minFocusDistance: d.minFocusDistance,
        formats: d.formats.length
      })));
      
      // Filter back cameras and select the most suitable one
      const backCameras = devices.filter(device => device.position === 'back');
      
      // Prefer cameras with flash/torch capability and precise 60fps support for PPG
      // Priority order with guaranteed fallback (replicates C# GetCaptureDeviceFormat logic):
      // 1. Back camera with flash + torch + exact 60fps support
      // 2. Back camera with flash + torch + any 60fps+ support  
      // 3. Back camera with flash + torch
      // 4. Back camera with torch only
      // 5. Any back camera (guaranteed fallback)
      const targetFrameRate = 60;
      
      this.device = backCameras.find(device => {
        const hasRequiredFeatures = device.hasTorch && device.hasFlash;
        if (!hasRequiredFeatures) return false;
        
        // Check if device supports exact target frame rate (similar to C# CMTime precision)
        const exactFrameRateFormat = device.formats.find(format => 
          format.minFps <= targetFrameRate && format.maxFps >= targetFrameRate
        );
        return !!exactFrameRateFormat;
      }) || backCameras.find(device => {
        const hasRequiredFeatures = device.hasTorch && device.hasFlash;
        if (!hasRequiredFeatures) return false;
        
        // Fallback: any format that supports 60fps or higher
        const highFrameRateFormat = device.formats.find(format => format.maxFps >= targetFrameRate);
        return !!highFrameRateFormat;
      }) || backCameras.find(device => 
        device.hasTorch && device.hasFlash
      ) || backCameras.find(device => 
        device.hasTorch
      ) || backCameras.find(device => 
        device.position === 'back'
      ) || null;
      
      if (!this.device) {
        console.error('No suitable back camera found');
        return false;
      }

      // Configure optimal camera format
      this.format = this.getOptimalCameraFormat(this.device);
      if (this.format) {
        console.log('Camera format configuration completed successfully');
      } else {
        console.warn('Using default camera format');
      }

      console.log('Selected camera device:', {
        id: this.device.id,
        position: this.device.position,
        hasFlash: this.device.hasFlash,
        hasTorch: this.device.hasTorch,
        minFocusDistance: this.device.minFocusDistance,
        selectedFormat: this.format ? {
          width: this.format.videoWidth,
          height: this.format.videoHeight,
          maxFps: this.format.maxFps
        } : 'default'
      });

      this.isInitialized = true;
      console.log('Camera service initialized successfully (camera not yet activated)');
      return true;
    } catch (error) {
      console.error('Failed to initialize camera service:', error);
      return false;
    }
  }

  /**
   * Check if camera service is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
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
   * Activate camera for recording (only called when recording is about to start)
   */
  async activateCamera(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.error('Camera service not initialized');
        return false;
      }

      if (!this.device) {
        console.error('No camera device available');
        return false;
      }

      console.log('Camera activated for PPG recording');
      return true;
    } catch (error) {
      console.error('Failed to activate camera:', error);
      return false;
    }
  }

  /**
   * Start video recording (camera should be activated first)
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
   * Get the selected camera format
   */
  getFormat(): CameraDeviceFormat | null {
    return this.format;
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
   * Deactivate camera after recording is complete
   */
  async deactivateCamera(): Promise<void> {
    try {
      await this.turnOffFlashlight();
      console.log('Camera deactivated after PPG recording');
    } catch (error) {
      console.error('Error deactivating camera:', error);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.camera = null;
    this.device = null;
    this.format = null;
    this.isRecording = false;
    this.isFlashlightOn = false;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const cameraService = new CameraService();
