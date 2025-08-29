/**
 * ErrorScreen Component
 * Screen displayed when measurement encounters an error
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

interface ErrorScreenProps {
  onCancel: () => void;
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ onCancel, onRetry }) => {
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
        <Text style={styles.title}>Uh oh!</Text>

        {/* Message */}
        <Text style={styles.message}>
          Something went wrong.{'\n'}
          Please retry your measurement.
        </Text>

        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../../assets/error.png')} 
            style={styles.errorIcon}
            resizeMode="contain"
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
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
  errorIcon: {
    width: 120,
    height: 120,
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
  retryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#4A90E2',
    width: width * 0.8,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
  },
});

export default ErrorScreen;
