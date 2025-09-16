/**
 * RestartScreen Component
 * Screen displayed when measurement is cancelled, asking user to restart
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
import Svg, { Path } from 'react-native-svg';
import RetrySvg from '../../../assets/retry.svg';

const { width, height } = Dimensions.get('window');

interface RestartScreenProps {
  onCancel: () => void;
  onRestart: () => void;
}

const RestartScreen: React.FC<RestartScreenProps> = ({ onCancel, onRestart }) => {
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
        <Text style={styles.title}>Restart</Text>

        {/* Message */}
        <Text style={styles.message}>
          Measurement has been cancelled.{'\n'}
          Would you like to restart?
        </Text>

        {/* Restart Icon */}
        <View style={styles.iconContainer}>
          <RetrySvg 
            width={120}
            height={120}
            style={styles.restartIcon}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
            <Text style={styles.restartButtonText}>Restart</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 80,
    zIndex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 40,
  },
  message: {
    fontSize: 18,
    color: '#4A90E2',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 80,
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restartIcon: {
    // SVG component will handle its own dimensions
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
  },
  restartButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#4A90E2',
    width: width * 0.8,
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
  },
});

export default RestartScreen;
