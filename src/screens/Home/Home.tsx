/**
 * MainScreen Component
 * Main blood pressure monitoring screen of the oBPM app
 *
 * @format
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import HealthService from '../../services/HealthService';
import MeasuringScreen from '../MeasuringScreen/MeasuringScreen';

const { width, height } = Dimensions.get('window');

const Home: React.FC = () => {
  const [showMeasuringScreen, setShowMeasuringScreen] = useState(false);

  const handleMeasure = async () => {
    console.log('Measure button pressed');
    
    // Request Health permissions
    try {
      const permissionGranted = await HealthService.requestPermissions();
      
      if (permissionGranted) {
        console.log('Health permissions granted');
        setShowMeasuringScreen(true);
      } else {
        Alert.alert(
          'Health Access Required',
          'This app needs access to Apple Health to track your blood pressure measurements. Please grant permission in Settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting health permissions:', error);
      Alert.alert(
        'Error',
        'Failed to request health permissions. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleReference = () => {
    console.log('Reference measurements button pressed');
  };

  const handleBackFromMeasuring = () => {
    setShowMeasuringScreen(false);
  };

  // Show measuring screen if active
  if (showMeasuringScreen) {
    return <MeasuringScreen onBack={handleBackFromMeasuring} />;
  }

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
        <Text style={styles.titleText}>How is your blood</Text>
        <Text style={styles.titleText}>pressure today?</Text>

        {/* Main Measure Button */}
        <View style={styles.measureButtonContainer}>
          <TouchableOpacity style={styles.measureButton} onPress={handleMeasure}>
            <Image
              source={require('../../../assets/icon-phone.png')}
              style={styles.phoneIcon}
              resizeMode="contain"
            />
            <Text style={styles.measureText}>Measure</Text>
          </TouchableOpacity>
        </View>

        {/* Reference Button */}
        <TouchableOpacity onPress={handleReference}>
          <Image
            source={require('../../../assets/reference-measurement-button.png')}
            style={styles.referenceButtonImage}
            resizeMode="contain"
          />
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  titleText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
    lineHeight: 40,
  },
  measureButtonContainer: {
    marginTop: 80,
    marginBottom: 80,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  measureButton: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: '#4A90E2',
    borderRadius: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#FFFFFF',
  },
  phoneIcon: {
    width: 40,
    height: 40,
    marginBottom: 10,
    tintColor: '#FFFFFF',
  },
  measureText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  referenceButtonImage: {
    width: 300,
    height: 90,
  },
});

export default Home;
