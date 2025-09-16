import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import CalibrationTutorialSvg from '../../../assets/calibration-tutorial.svg';

const { width, height } = Dimensions.get('window');

interface CalibrationInfoProps {
  onBack: () => void;
  onStart: () => void;
}

const CalibrationInfo: React.FC<CalibrationInfoProps> = ({ onBack, onStart }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Background waves */}
      <View style={styles.backgroundWaves}>
        <Svg width={width} height={200} viewBox={`0 0 ${width} 200`} style={styles.bottomWave}>
          <Path
            d={`M0,100 Q${width/4},120 ${width/2},100 T${width},100 L${width},200 L0,200 Z`}
            fill="#E8F4FD"
          />
        </Svg>
      </View>

      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="#4A90E2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Measurement by your phone</Text>
        <View style={styles.progressDots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.progressLine} />
          <View style={styles.dot} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.titleText}>Reference</Text>
        <Text style={styles.titleText}>measurements improve</Text>
        <Text style={styles.titleText}>accuracy</Text>

        <Text style={styles.descriptionText}>
          A reference measurement will help the algorithm to get to know your levels better and become more accurate
        </Text>

        {/* Spacer to push content up */}
        <View style={styles.spacer} />

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>

      {/* Background Calibration Tutorial Illustration */}
      <View style={styles.backgroundIllustration}>
        <CalibrationTutorialSvg
          width={width}
          height={height * 0.4}
          style={styles.tutorialSvg}
        />
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
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    marginLeft: 8,
    fontWeight: '500',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
  },
  activeDot: {
    backgroundColor: '#4A90E2',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
    lineHeight: 36,
  },
  descriptionText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 20,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  spacer: {
    flex: 1,
  },
  backgroundIllustration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    alignItems: 'center',
  },
  tutorialSvg: {
    marginBottom: 40,
    // SVG component will handle its own dimensions
  },
  startButton: {
    width: width * 0.8,
    height: 56,
    backgroundColor: '#4A90E2',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CalibrationInfo;
