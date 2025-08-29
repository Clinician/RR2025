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
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import HealthService from '../../services/HealthService';
import StartMeasurement from '../StartMeasurement/StartMeasurement';
import MeasuringScreen from '../MeasuringScreen/MeasuringScreen';
import RestartScreen from '../RestartScreen/RestartScreen';
import ErrorScreen from '../ErrorScreen/ErrorScreen';
import CalculatingResultsScreen from '../CalculatingResultsScreen/CalculatingResultsScreen';
import ResultsScreen from '../ResultsScreen/ResultsScreen';

const { width, height } = Dimensions.get('window');

const Home: React.FC = () => {
  const [showStartMeasurement, setShowStartMeasurement] = useState(false);
  const [showMeasuringScreen, setShowMeasuringScreen] = useState(false);
  const [showRestartScreen, setShowRestartScreen] = useState(false);
  const [showErrorScreen, setShowErrorScreen] = useState(false);
  const [showCalculatingResults, setShowCalculatingResults] = useState(false);
  const [showResultsScreen, setShowResultsScreen] = useState(false);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  const handleMeasure = async () => {
    console.log('Measure button pressed');
    
    // Request Health permissions
    try {
      const permissionGranted = await HealthService.requestPermissions(setIsRequestingPermissions);
      
      if (permissionGranted) {
        console.log('Health permissions granted');
        setShowStartMeasurement(true);
      } else {
        // Show alert with retry option
        Alert.alert(
          'Health Access Required',
          'This app requires access to Apple Health to function properly. Without these permissions, you cannot use the blood pressure monitoring features.\n\nWould you like to try granting permissions again?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Try Again',
              onPress: () => handleMeasure(), // Retry permission request
            },
            {
              text: 'Settings',
              onPress: () => {
                Alert.alert(
                  'Enable in Settings',
                  'To enable Health access:\n\n1. Open Settings app\n2. Go to Privacy & Security\n3. Select Health\n4. Find this app and enable permissions',
                  [{ text: 'OK' }]
                );
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting health permissions:', error);
      setIsRequestingPermissions(false);
      Alert.alert(
        'Permission Error',
        'Failed to request health permissions. Please ensure you have the latest version of iOS and try again.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Retry',
            onPress: () => handleMeasure(),
          },
        ]
      );
    }
  };

  const handleResults = async () => {
    console.log('Results button pressed');
    
    // Request Health permissions (same as measure button)
    try {
      const permissionGranted = await HealthService.requestPermissions(setIsRequestingPermissions);
      
      if (permissionGranted) {
        console.log('Health permissions granted for results');
        setShowResultsScreen(true);
      } else {
        // Show alert with retry option
        Alert.alert(
          'Health Access Required',
          'This app requires access to Apple Health to function properly. Without these permissions, you cannot use the blood pressure monitoring features.\n\nWould you like to try granting permissions again?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Try Again',
              onPress: () => handleResults(), // Retry permission request
            },
            {
              text: 'Settings',
              onPress: () => {
                Alert.alert(
                  'Enable in Settings',
                  'To enable Health access:\n\n1. Open Settings app\n2. Go to Privacy & Security\n3. Select Health\n4. Find this app and enable permissions',
                  [{ text: 'OK' }]
                );
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting health permissions for results:', error);
      setIsRequestingPermissions(false);
      Alert.alert(
        'Permission Error',
        'Failed to request health permissions. Please ensure you have the latest version of iOS and try again.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Retry',
            onPress: () => handleResults(),
          },
        ]
      );
    }
  };

  const handleReference = () => {
    console.log('Reference measurements button pressed');
  };

  const handleBackFromStartMeasurement = () => {
    console.log('Back from StartMeasurement pressed');
    setShowStartMeasurement(false);
  };

  const handleStartMeasurement = () => {
    console.log('Starting measurement...');
    setShowStartMeasurement(false);
    setShowMeasuringScreen(true);
  };

  const handleStopFromMeasuring = () => {
    setShowMeasuringScreen(false);
    setShowRestartScreen(true);
  };

  const handleMeasurementComplete = () => {
    setShowMeasuringScreen(false);
    setShowCalculatingResults(true);
  };

  const handleCalculationComplete = () => {
    setShowCalculatingResults(false);
    setShowResultsScreen(true);
  };

  const handleMeasurementError = () => {
    console.log('Measurement error occurred');
    setShowMeasuringScreen(false);
    setShowErrorScreen(true);
  };

  const handleSkipMeasurement = () => {
    console.log('Measurement skipped');
    setShowMeasuringScreen(false);
    setShowCalculatingResults(true);
  };

  const handleBackFromResults = () => {
    setShowResultsScreen(false);
  };

  const handleCancelFromRestart = () => {
    setShowRestartScreen(false);
  };

  const handleRestartFromRestart = () => {
    setShowRestartScreen(false);
    setShowStartMeasurement(true);
  };

  const handleCancelFromError = () => {
    setShowErrorScreen(false);
  };

  const handleRetryFromError = () => {
    setShowErrorScreen(false);
    setShowStartMeasurement(true);
  };

  // Show start measurement screen if active
  if (showStartMeasurement) {
    return <StartMeasurement onBack={handleBackFromStartMeasurement} onStart={handleStartMeasurement} />;
  }

  // Show measuring screen if active
  if (showMeasuringScreen) {
    return (
      <MeasuringScreen
        onStop={handleStopFromMeasuring}
        onComplete={handleMeasurementComplete}
        onError={handleMeasurementError}
        onSkip={handleSkipMeasurement}
      />
    );
  }

  // Show restart screen if active
  if (showRestartScreen) {
    return <RestartScreen onCancel={handleCancelFromRestart} onRestart={handleRestartFromRestart} />;
  }

  // Show error screen if active
  if (showErrorScreen) {
    return <ErrorScreen onCancel={handleCancelFromError} onRetry={handleRetryFromError} />;
  }

  // Show calculating results screen if active
  if (showCalculatingResults) {
    return <CalculatingResultsScreen onComplete={handleCalculationComplete} />;
  }

  // Show results screen if active
  if (showResultsScreen) {
    return <ResultsScreen onBack={handleBackFromResults} />;
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
          <TouchableOpacity 
            style={styles.measureButton} 
            onPress={handleMeasure}
            disabled={isRequestingPermissions}
          >
            {isRequestingPermissions ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <>
                <Image
                  source={require('../../../assets/icon-phone.png')}
                  style={styles.phoneIcon}
                  resizeMode="contain"
                />
                <Text style={styles.measureText}>Measure</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Button */}
        <TouchableOpacity 
          style={styles.resultsButton} 
          onPress={handleResults}
          disabled={isRequestingPermissions}
        >
          {isRequestingPermissions ? (
            <ActivityIndicator size="small" color="#4A90E2" />
          ) : (
            <Text style={styles.resultsButtonText}>Results</Text>
          )}
        </TouchableOpacity>

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
  resultsButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  resultsButtonText: {
    color: '#4A90E2',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  referenceButtonImage: {
    width: 300,
    height: 90,
  },
});

export default Home;
