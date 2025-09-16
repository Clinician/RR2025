/**
 * MeasuringScreen Component
 * Screen displayed during blood pressure measurement with timer
 *
 * @format
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Camera } from 'react-native-vision-camera';
import Svg, { Path, Circle } from 'react-native-svg';
import { cameraService } from '../../services/CameraService';

const { width, height } = Dimensions.get('window');

interface MeasuringScreenProps {
  onStop: () => void;
  onComplete: (videoPath?: string) => void;
  onError: () => void;
  onSkip: () => void;
}

const MeasuringScreen: React.FC<MeasuringScreenProps> = ({ onStop, onComplete, onError, onSkip }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [progress, setProgress] = useState(1);
  const [_, setRecordedVideoPath] = useState<string | undefined>();
  const [device, setDevice] = useState<any>(null);
  const [format, setFormat] = useState<any>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [recordingStarted, setRecordingStarted] = useState(false);
  const [cameraActivated, setCameraActivated] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    
    // Initialize camera service (permissions only, don't activate camera yet)
    const initializeCamera = async () => {
      try {
        const initialized = await cameraService.initialize();
        if (!initialized) {
          console.error('Failed to initialize camera service');
          onError();
          return;
        }

        // Get camera device and format from service but don't activate yet
        const cameraDevice = cameraService.getDevice();
        const cameraFormat = cameraService.getFormat();
        if (!cameraDevice) {
          console.error('No camera device available');
          onError();
          return;
        }

        setDevice(cameraDevice);
        setFormat(cameraFormat);
        console.log('Camera service initialized (camera not yet activated)', {
          device: cameraDevice.id,
          format: cameraFormat ? {
            width: cameraFormat.videoWidth,
            height: cameraFormat.videoHeight,
            maxFps: cameraFormat.maxFps
          } : 'default'
        });
        
        // Start the recording process after a short delay to allow UI to settle
        setTimeout(() => {
          startRecordingProcess();
        }, 1000);
      } catch (error) {
        console.error('Error initializing camera:', error);
        onError();
      }
    };

    initializeCamera();

    return () => {
      // Cleanup timer if it exists
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      cameraService.cleanup();
    };
  }, [onComplete, onError]);

  // Function to activate camera and start recording (only when needed for PPG)
  const startRecordingProcess = async () => {
    try {
      console.log('Starting PPG recording process - activating camera now');
      
      // Activate camera only when we're about to record
      const activated = await cameraService.activateCamera();
      if (!activated) {
        console.error('Failed to activate camera');
        onError();
        return;
      }

      setCameraActivated(true);
      setCameraReady(true);
      
      // Wait a moment for camera to be ready
      setTimeout(async () => {
        if (!cameraRef.current) {
          console.error('Camera ref not available');
          onError();
          return;
        }

        // Set camera reference
        cameraService.setCameraRef(cameraRef.current);

        // Turn on flashlight and start recording
        await cameraService.turnOnFlashlight();
        const recordingStarted = await cameraService.startRecording();
        
        if (!recordingStarted) {
          console.error('Failed to start video recording');
          onError();
          return;
        }

        console.log('Camera activated, flashlight on, recording started for PPG signal');
        setRecordingStarted(true);
      }, 500);
    } catch (error) {
      console.error('Error in recording process:', error);
      onError();
    }
  };

  // Timer effect - only starts when recording has begun
  useEffect(() => {
    if (!recordingStarted) return;

    const startTime = Date.now();
    const totalDuration = 30000; // 30 seconds in milliseconds

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalDuration - elapsed);
      
      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setTimeLeft(0);
        setProgress(0);
        handleMeasurementComplete();
        return;
      }

      const remainingSeconds = Math.ceil(remaining / 1000);
      const progressValue = remaining / totalDuration;
      
      setTimeLeft(remainingSeconds);
      setProgress(progressValue);
    }, 16); // ~60fps for smooth animation

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [recordingStarted, onComplete]);

  const handleMeasurementComplete = async () => {
    try {
      // Stop recording and get video path
      const result = await cameraService.stopRecording();
      await cameraService.deactivateCamera();
      
      if (result) {
        setRecordedVideoPath(result.path);
        onComplete(result.path);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing measurement:', error);
      onComplete();
    }
  };

  const handleStop = async () => {
    try {
      await cameraService.stopRecording();
      await cameraService.deactivateCamera();
      cameraService.cleanup();
      onStop();
    } catch (error) {
      console.error('Error stopping measurement:', error);
      onStop();
    }
  };

  const handleSkip = async () => {
    try {
      await cameraService.stopRecording();
      await cameraService.deactivateCamera();
      cameraService.cleanup();
      onSkip();
    } catch (error) {
      console.error('Error skipping measurement:', error);
      onSkip();
    }
  };

  const handleError = async () => {
    try {
      await cameraService.stopRecording();
      await cameraService.deactivateCamera();
      cameraService.cleanup();
      onError();
    } catch (error) {
      console.error('Error handling measurement error:', error);
      onError();
    }
  };

  const circleRadius = 80;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - progress);

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera View - Only activated when recording PPG signal */}
      {device && cameraActivated && cameraReady && (
        <Camera
          ref={cameraRef}
          style={styles.hiddenCamera}
          device={device}
          format={format}
          isActive={true}
          video={true}
          audio={false}
          fps={60}
          outputOrientation='preview'
          torch={cameraService.flashlightOn ? 'on' : 'off'}
        />
      )}

      {/* Background waves */}
      <View style={styles.backgroundWaves}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={styles.backgroundSvg}>
          {/* Bottom wave */}
          <Path
            d={`M0,${height * 0.7} Q${width/4},${height * 0.75} ${width/2},${height * 0.7} T${width},${height * 0.7} L${width},${height} L0,${height} Z`}
            fill="#B8D4F0"
          />
          {/* Top wave */}
          <Path
            d={`M0,${height * 0.6} Q${width/3},${height * 0.65} ${width * 0.7},${height * 0.6} T${width},${height * 0.6} L${width},${height} L0,${height} Z`}
            fill="#D1E7F7"
          />
        </Svg>
      </View>

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Measuring</Text>

        {/* Circular Progress Timer */}
        <View style={styles.timerContainer}>
          <Svg width={200} height={200} style={styles.progressCircle}>
            {/* Background circle */}
            <Circle
              cx="100"
              cy="100"
              r={circleRadius}
              stroke="#E8F4FD"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress circle */}
            <Circle
              cx="100"
              cy="100"
              r={circleRadius}
              stroke="#4A90E2"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            />
          </Svg>
          <Text style={styles.timerText}>{timeLeft}</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.errorButton} onPress={handleError}>
            <Text style={styles.errorButtonText}>Error</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info text - Fixed at bottom */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Keep your finger steady on the camera and flash. Recording in progress...
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  hiddenCamera: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  backgroundWaves: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
  backgroundSvg: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    zIndex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 80,
  },
  timerContainer: {
    position: 'relative',
    marginBottom: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    transform: [{ rotate: '0deg' }],
  },
  timerText: {
    position: 'absolute',
    fontSize: 48,
    fontWeight: '300',
    color: '#4A90E2',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 60,
  },
  stopButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFA500',
    textAlign: 'center',
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 2,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#4A90E2',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MeasuringScreen;
