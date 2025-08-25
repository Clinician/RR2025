/**
 * MeasuringScreen Component
 * Screen displayed while measuring blood pressure
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

const { width } = Dimensions.get('window');

interface MeasuringScreenProps {
  onBack: () => void;
}

const MeasuringScreen: React.FC<MeasuringScreenProps> = ({ onBack }) => {
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

      <View style={styles.content}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.measuringContainer}>
          <Text style={styles.measuringText}>Measuring...</Text>
          
          {/* Simple loading indicator */}
          <View style={styles.loadingContainer}>
            <View style={styles.loadingDot} />
            <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
            <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
          </View>
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
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  measuringContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  measuringText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A90E2',
    marginHorizontal: 4,
    opacity: 0.3,
  },
  loadingDotDelay1: {
    opacity: 0.6,
  },
  loadingDotDelay2: {
    opacity: 1,
  },
});

export default MeasuringScreen;
