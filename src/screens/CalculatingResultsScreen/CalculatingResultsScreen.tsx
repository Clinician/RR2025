/**
 * CalculatingResultsScreen Component
 * Screen displayed while calculating blood pressure results
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { video2PPGService } from '../../services/Video2PPGService';
import { videoFrameExtractorService } from '../../services/VideoFrameExtractorService';

const { width, height } = Dimensions.get('window');

interface CalculatingResultsScreenProps {
  onComplete: () => void;
  videoPath?: string;
}

interface PPGProcessingResult {
  averageSignals: number[];
  frameCount: number;
  processingTime: number;
  qualityWarnings: number;
}

const CalculatingResultsScreen: React.FC<CalculatingResultsScreenProps> = ({ onComplete, videoPath }) => {
  const [animatedValues] = useState([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showActualProgress, setShowActualProgress] = useState(false);

  useEffect(() => {
    // Start the loading animation
    const animateLoading = () => {
      const animations = animatedValues.map((animatedValue, index) => 
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.loop(
            Animated.sequence([
              Animated.timing(animatedValue, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.timing(animatedValue, {
                toValue: 0.3,
                duration: 600,
                useNativeDriver: true,
              }),
            ])
          ),
        ])
      );

      Animated.parallel(animations).start();
    };

    animateLoading();

    // Process video with Video2PPGConverter if available
    const processVideo = async (): Promise<PPGProcessingResult | null> => {
      if (!videoPath) {
        console.log('No video path provided, skipping PPG processing');
        return null;
      }

      console.log('Processing video with Video2PPGConverter:', videoPath);
      
      try {
        // Get video metadata first
        const videoMetadata = await getVideoMetadata(videoPath);
        console.log('Video metadata:', videoMetadata);
        
        // Initialize the Video2PPGConverter with actual video dimensions
        await video2PPGService.initialize(
          videoMetadata.width, 
          videoMetadata.height, 
          0 // Default phone model
        );
        console.log('Video2PPGConverter initialized successfully');
        
        // Extract frames from video and process them
        const processingResult = await processVideoFrames(videoPath, videoMetadata);
        
        console.log('Video processing completed:', processingResult);
        return processingResult;
        
      } catch (error) {
        console.error('Error processing video with Video2PPGConverter:', error);
        return null;
      }
    };

    // Get video metadata (dimensions, frame rate, duration)
    const getVideoMetadata = async (videoPath: string) => {
      return await videoFrameExtractorService.getVideoMetadata(videoPath);
    };

    // Process video frames and extract PPG signals
    const processVideoFrames = async (videoPath: string, metadata: any): Promise<PPGProcessingResult> => {
      const startTime = Date.now();
      const allSignals: number[][] = [];
      let qualityWarnings = 0;
      
      // Show actual progress bar once processing starts
      setShowActualProgress(true);
      
      // Generate frame indices to extract (sample evenly across video)
      const maxFrames = Math.min(75, metadata.totalFrames); // Process max 75 frames for optimal performance
      const frameIndices = videoFrameExtractorService.generateFrameIndices(metadata.totalFrames, maxFrames);
      const framesToProcess = frameIndices.length;
      
      console.log(`Processing ${framesToProcess} frames from video with ${metadata.totalFrames} total frames`);
      
      // Extract frames in batches for better performance
      const batchSize = 25;
      for (let batchStart = 0; batchStart < framesToProcess; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize, framesToProcess);
        const batchIndices = frameIndices.slice(batchStart, batchEnd);
        
        try {
          // Extract batch of frames
          const batchFrames = await videoFrameExtractorService.extractFrames(
            videoPath, 
            batchIndices, 
            metadata.totalFrames
          );
          console.log(`Extracted ${batchFrames.length} frames for batch ${batchStart}-${batchEnd}`);
          
          // Process each frame in the batch
          for (let i = 0; i < batchFrames.length; i++) {
            const frameData = batchFrames[i];
            const currentFrameIndex = batchStart + i;
            
            try {
              // Update progress
              const progress = (currentFrameIndex / framesToProcess) * 100;
              setProcessingProgress(progress);
              
              // Convert frame to PPG signals using base64 strings directly
              const ppgResult = await video2PPGService.convertFrameiOS(
                frameData.timestamp,
                frameData.yChannel,
                frameData.uvChannel
              );
              
              allSignals.push(ppgResult.signals);
              
              if (ppgResult.qualityWarning) {
                qualityWarnings++;
              }
              
              // Log progress every 10 frames
              if (currentFrameIndex % 10 === 0) {
                console.log(`Processed frame ${currentFrameIndex}/${framesToProcess}, signals: ${ppgResult.signals.length}`);
              }
              
            } catch (error) {
              console.error(`Error processing frame ${currentFrameIndex}:`, error);
            }
          }
          
        } catch (error) {
          console.error(`Error extracting batch ${batchStart}-${batchEnd}:`, error);
          // Continue with next batch
        }
      }
      
      // Aggregate results from all frames
      const averageSignals = aggregateSignals(allSignals);
      const processingTime = Date.now() - startTime;
      
      return {
        averageSignals,
        frameCount: allSignals.length, // Use actual processed frames count
        processingTime,
        qualityWarnings
      };
    };


    // Aggregate PPG signals from all frames
    const aggregateSignals = (allSignals: number[][]): number[] => {
      if (allSignals.length === 0) return [];
      
      const signalLength = allSignals[0].length;
      const averageSignals = new Array(signalLength).fill(0);
      
      // Calculate average for each signal component
      for (let i = 0; i < signalLength; i++) {
        let sum = 0;
        for (const signals of allSignals) {
          sum += signals[i] || 0;
        }
        averageSignals[i] = sum / allSignals.length;
      }
      
      return averageSignals;
    };

    // Start video processing
    const startProcessing = async () => {
      const result = await processVideo();
      
      if (result) {
        console.log('Final PPG Processing Results:', {
          averageSignals: result.averageSignals,
          frameCount: result.frameCount,
          processingTime: `${result.processingTime}ms`,
          qualityWarnings: result.qualityWarnings,
          signalStrength: result.averageSignals.reduce((sum, val) => sum + val, 0) / result.averageSignals.length
        });
        
        // Store results for use in next screen (you might want to pass this to onComplete)
        // For now, we'll just log the results
      }
      
      // Complete processing after a short delay to show final progress
      setTimeout(() => {
        onComplete();
      }, 1000);
    };

    startProcessing();

    // Fallback timer in case processing takes too long
    // const fallbackTimer = setTimeout(() => {
    //   console.log('Processing timeout reached, advancing to results');
    //   onComplete();
    // }, 15000); // 15 seconds max

    return () => {
      // clearTimeout(fallbackTimer);
      animatedValues.forEach(animatedValue => animatedValue.stopAnimation());
    };
  }, [animatedValues, onComplete, videoPath]);

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.title}>Calculating Results</Text>

        {/* Processing progress */}
        {videoPath && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {showActualProgress 
                ? `Processing video frames: ${Math.round(processingProgress)}%`
                : 'Preparing video analysis...'
              }
            </Text>
            <View style={styles.progressBar}>
              {showActualProgress ? (
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${processingProgress}%` }
                  ]} 
                />
              ) : (
                <View style={styles.skeletonProgressFill} />
              )}
            </View>
          </View>
        )}

        {/* Loading dots */}
        <View style={styles.loadingContainer}>
          {animatedValues.map((animatedValue, index) => (
            <Animated.View
              key={index}
              style={[
                styles.loadingDot,
                {
                  opacity: animatedValue,
                  transform: [
                    {
                      scale: animatedValue.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [0.8, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Info section - Fixed at bottom */}
      <View style={styles.infoContainer}>
        <View style={styles.infoIcon}>
          <Text style={styles.infoIconText}>💡</Text>
        </View>
        <Text style={styles.infoText}>
          Croup is an inflammation of the larynx, trachea and{'\n'}
          bronchi. It affects the voice box.
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 80,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 120,
  },
  loadingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4A90E2',
    marginHorizontal: 8,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  infoIcon: {
    marginBottom: 15,
  },
  infoIconText: {
    fontSize: 24,
  },
  infoText: {
    fontSize: 16,
    color: '#4A90E2',
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    width: '80%',
    marginBottom: 40,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#4A90E2',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  skeletonProgressFill: {
    height: '100%',
    backgroundColor: '#C0C0C0',
    borderRadius: 4,
    width: '20%',
    opacity: 0.6,
  },
});

export default CalculatingResultsScreen;
