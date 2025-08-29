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
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface StartMeasurementProps {
  onBack: () => void;
  onStart: () => void;
}

const StartMeasurement: React.FC<StartMeasurementProps> = ({ onBack, onStart }) => {
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

        {/* Phone illustration */}
        <View style={styles.phoneContainer}>
          <Image
            source={require('../../../assets/finger-placement.png')}
            style={styles.fingerPlacementImage}
            resizeMode="contain"
          />
        </View>

        {/* Start button */}
        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>Start</Text>
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
    top: 0,
  },
  backgroundSvg: {
    position: 'absolute',
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
  phoneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  fingerPlacementImage: {
    width: width,
    height: height,
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
