/**
 * StartMeasurement Component
 * Screen with instructions for finger placement before measurement
 *
 * @format
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import FingerPlacementSvg from '../../../assets/finger-placement.svg';

const { width } = Dimensions.get('window');

interface StartMeasurementProps {
  onBack: () => void;
  onStart: () => void;
  isCalibrationFlow?: boolean;
}

const StartMeasurement: React.FC<StartMeasurementProps> = ({ onBack, onStart, isCalibrationFlow = false }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Back button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            console.log('Back button pressed in StartMeasurement');
            onBack();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* Instruction text */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Place your right forefinger to cover phone camera and flash to get a correct result
          </Text>
        </View>

        {/* Spacer to push illustration to bottom */}
        <View style={styles.spacer} />

        {/* Start button */}
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>

      {/* Phone illustration at bottom */}
      <View style={styles.phoneContainer}>
        <FingerPlacementSvg
          width={width}
          height={400}
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
    bottom: 100,
    left: 0,
    right: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  backgroundSvg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 2,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  instructionContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  instructionText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
    lineHeight: 32,
  },
  spacer: {
    flex: 1,
  },
  phoneContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 400,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  startButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default StartMeasurement;
