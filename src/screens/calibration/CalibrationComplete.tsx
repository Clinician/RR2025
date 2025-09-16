import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import CalibrationCompleteSvg from '../../../assets/calibration-complete.svg';
import { useCalibration } from '../../contexts/CalibrationContext';

const { width } = Dimensions.get('window');

interface CalibrationCompleteProps {
  onComplete: () => void;
}

const CalibrationComplete: React.FC<CalibrationCompleteProps> = ({ onComplete }) => {
  const { calibrationOffset, saveCalibrationOffsets } = useCalibration();

  const handleComplete = async () => {
    try {
      if (calibrationOffset) {
        console.log('Saving calibration offsets:', calibrationOffset);
        await saveCalibrationOffsets(
          calibrationOffset.systolicOffset,
          calibrationOffset.diastolicOffset
        );
        console.log('Calibration offsets saved successfully');
      }
      onComplete();
    } catch (error) {
      console.error('Error saving calibration offsets:', error);
      Alert.alert(
        'Save Error',
        'Failed to save calibration data. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background waves */}
      <View style={styles.backgroundWaves}>
        <View style={[styles.bottomWave, { backgroundColor: '#E8F4FD', height: 200 }]} />
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Measurement by your phone</Text>
        <View style={styles.progressDots}>
          <View style={styles.dot} />
          <View style={[styles.progressLine, styles.activeProgressLine]} />
          <View style={styles.dot} />
          <View style={[styles.progressLine, styles.activeProgressLine]} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.titleText}>Calibration completed</Text>

        {/* Calibration Complete Illustration */}
        <View style={styles.illustrationContainer}>
          <CalibrationCompleteSvg width={width * 0.8} height={280} />
        </View>

        {/* OK Button */}
        <TouchableOpacity style={styles.okButton} onPress={handleComplete}>
          <Text style={styles.okButtonText}>Ok</Text>
        </TouchableOpacity>
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
  progressContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 60,
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
  activeProgressLine: {
    backgroundColor: '#4A90E2',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
    lineHeight: 36,
  },
  illustrationContainer: {
    width: width * 0.8,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  okButton: {
    width: width * 0.6,
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  okButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
  },
});

export default CalibrationComplete;
