/**
 * MainScreen Component
 * Main blood pressure monitoring screen of the oBPM app
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import CalibrationOffsetService from '../../services/CalibrationOffsetService';
import Svg, { Path, Circle } from 'react-native-svg';
import CirclesSvg from '../../../assets/circles.svg';
import PhoneIconSvg from '../../../assets/icon-phone.svg';
import ResultsSvg from '../../../assets/results.svg';
import ReferenceMeasurementSvg from '../../../assets/reference-measurement.svg';
import HealthService from '../../services/HealthService';
import StartMeasurement from '../measure/StartMeasurement';
import MeasuringScreen from '../measure/Measuring';
import RestartScreen from '../measure/Restart';
import ErrorScreen from '../measure/Error';
import CalculatingResultsScreen from '../measure/CalculatingResults';
import ResultsScreen from '../ResultsScreen/ResultsScreen';
import AboutScreen from '../settings/About';
import SettingsScreen from '../settings/Settings';
import PrivacyScreen from '../settings/Privacy';
import TermsAndConditions from '../onboarding/TermsAndConditions';
import CalibrationInfo from '../calibration/CalibrationInfo';
import ReferenceMeasurement from '../calibration/ReferenceMeasurement';
import CalibrationComplete from '../calibration/CalibrationComplete';
import { useCalibration } from '../../contexts/CalibrationContext';

const { width, height } = Dimensions.get('window');

const Home: React.FC = () => {
  const { 
    setCalibrationMode, 
    setReferenceMeasurement, 
    resetCalibration, 
    areStoredOffsetsValid, 
    checkOffsetValidity,
    isCalibrationMode 
  } = useCalibration();
  const [showStartMeasurement, setShowStartMeasurement] = useState(false);
  const [showMeasuringScreen, setShowMeasuringScreen] = useState(false);
  const [showRestartScreen, setShowRestartScreen] = useState(false);
  const [showErrorScreen, setShowErrorScreen] = useState(false);
  const [showCalculatingResults, setShowCalculatingResults] = useState(false);
  const [showResultsScreen, setShowResultsScreen] = useState(false);
  const [showAboutScreen, setShowAboutScreen] = useState(false);
  const [showSettingsScreen, setShowSettingsScreen] = useState(false);
  const [showPrivacyScreen, setShowPrivacyScreen] = useState(false);
  const [showTermsAndConditions, setShowTermsAndConditions] = useState(false);
  const [showCalibrationInfo, setShowCalibrationInfo] = useState(false);
  const [showReferenceMeasurement, setShowReferenceMeasurement] = useState(false);
  const [showCalibrationComplete, setShowCalibrationComplete] = useState(false);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const [recordedVideoPath, setRecordedVideoPath] = useState<string | undefined>();
  const [calibrationInfo, setCalibrationInfo] = useState<{
    isValid: boolean;
    timestamp: Date | null;
    calibrationType: 'expert' | 'home' | null;
    ageMinutes: number | null;
  } | null>(null);

  // Check offset validity and load calibration info on component mount and when returning from other screens
  useEffect(() => {
    const loadCalibrationData = async () => {
      checkOffsetValidity();
      const info = await CalibrationOffsetService.getCalibrationInfo();
      setCalibrationInfo(info);
    };
    
    loadCalibrationData();
  }, []);

  // Format calibration status message
  const getCalibrationStatusMessage = (): string => {
    if (!calibrationInfo || !calibrationInfo.isValid) {
      return '';
    }

    const { timestamp, calibrationType, ageMinutes } = calibrationInfo;
    
    if (!timestamp || ageMinutes === null) {
      return '';
    }

    const now = new Date();
    const calibrationDate = new Date(timestamp);
    
    // Check if calibration was today
    const isToday = now.toDateString() === calibrationDate.toDateString();
    
    // Check if calibration was yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === calibrationDate.toDateString();
    
    const dateText = isToday 
      ? 'today' 
      : isYesterday
      ? 'yesterday'
      : calibrationDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: calibrationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    
    const calibrationTypeText = calibrationType === 'expert' ? 'by an expert' : 'at home';
    
    return `Calibrated ${dateText} ${calibrationTypeText}`;
  };

  const handleMeasure = async () => {
    console.log('Measure button pressed');
    
    // If offsets are not valid, do nothing (button should be disabled)
    if (!areStoredOffsetsValid) {
      console.log('Measure button disabled - no valid calibration offsets');
      return;
    }

    // Check offset validity again before measurement
    const isValid = await checkOffsetValidity();
    if (!isValid) {
      console.log('Measure button disabled - calibration offsets expired');
      return;
    }
    
    // Request Health permissions for measurement
    try {
      const permissionGranted = await HealthService.requestPermissions(setIsRequestingPermissions);
      
      if (permissionGranted) {
        console.log('Health permissions granted, starting measurement');
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
    console.log('Calibrate button pressed');
    setCalibrationMode(true);
    setShowCalibrationInfo(true);
  };

  const handleSettings = () => {
    console.log('Settings button pressed');
    setShowSettingsScreen(true);
  };

  const handleBackFromSettings = () => {
    console.log('Back from Settings pressed');
    setShowSettingsScreen(false);
  };

  const handleAbout = () => {
    console.log('About button pressed');
    setShowSettingsScreen(false);
    setShowAboutScreen(true);
  };

  const handleBackFromAbout = () => {
    console.log('Back from About pressed');
    setShowAboutScreen(false);
    setShowSettingsScreen(true);
  };

  const handlePrivacy = () => {
    console.log('Privacy button pressed');
    setShowSettingsScreen(false);
    setShowPrivacyScreen(true);
  };

  const handleBackFromPrivacy = () => {
    console.log('Back from Privacy pressed');
    setShowPrivacyScreen(false);
    setShowSettingsScreen(true);
  };

  const handleTermsAndConditions = () => {
    console.log('Terms and Conditions button pressed');
    setShowPrivacyScreen(false);
    setShowTermsAndConditions(true);
  };

  const handleBackFromTermsAndConditions = () => {
    console.log('Back from Terms and Conditions pressed');
    setShowTermsAndConditions(false);
    setShowPrivacyScreen(true);
  };

  const handleBackFromStartMeasurement = () => {
    console.log('Back from StartMeasurement pressed');
    setShowStartMeasurement(false);
    
    // If we're in calibration mode, go back to reference measurement
    if (isCalibrationMode) {
      setShowReferenceMeasurement(true);
    }
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

  const handleMeasurementComplete = (videoPath?: string) => {
    setRecordedVideoPath(videoPath);
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

  // Calibration workflow handlers
  const handleBackFromCalibrationInfo = () => {
    setShowCalibrationInfo(false);
    resetCalibration();
  };

  const handleStartCalibration = () => {
    setShowCalibrationInfo(false);
    setShowReferenceMeasurement(true);
  };

  const handleBackFromReferenceMeasurement = () => {
    setShowReferenceMeasurement(false);
    setShowCalibrationInfo(true);
  };

  const handleReferenceMeasurementNext = (systolic: number, diastolic: number, measurementType: import('../../contexts/CalibrationContext').MeasurementType) => {
    setReferenceMeasurement({
      systolic,
      diastolic,
      timestamp: new Date(),
      measurementType,
    });
    setShowReferenceMeasurement(false);
    setShowStartMeasurement(true);
  };

  const handleCalibrationComplete = () => {
    setShowCalibrationComplete(false);
    resetCalibration();
  };

  // Show start measurement screen if active
  if (showStartMeasurement) {
    return <StartMeasurement 
      onBack={handleBackFromStartMeasurement} 
      onStart={handleStartMeasurement} 
      isCalibrationFlow={isCalibrationMode}
    />;
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
    return (
      <CalculatingResultsScreen 
        onComplete={handleCalculationComplete} 
        onCalibrationComplete={() => {
          setShowCalculatingResults(false);
          setShowCalibrationComplete(true);
        }}
        videoPath={recordedVideoPath} 
      />
    );
  }

  // Show results screen if active
  if (showResultsScreen) {
    return (
      <ResultsScreen 
        onBack={handleBackFromResults} 
        onCalibrationComplete={() => {
          setShowResultsScreen(false);
          setShowCalibrationComplete(true);
        }}
      />
    );
  }

  // Show settings screen if active
  if (showSettingsScreen) {
    return <SettingsScreen onBack={handleBackFromSettings} onAbout={handleAbout} onPrivacy={handlePrivacy} />;
  }

  // Show about screen if active
  if (showAboutScreen) {
    return <AboutScreen onBack={handleBackFromAbout} />;
  }

  // Show privacy screen if active
  if (showPrivacyScreen) {
    return <PrivacyScreen onBack={handleBackFromPrivacy} onTermsAndConditions={handleTermsAndConditions} />;
  }

  // Show terms and conditions screen if active
  if (showTermsAndConditions) {
    return <TermsAndConditions onBack={handleBackFromTermsAndConditions} showAcceptButton={false} />;
  }

  // Show calibration info screen if active
  if (showCalibrationInfo) {
    return <CalibrationInfo onBack={handleBackFromCalibrationInfo} onStart={handleStartCalibration} />;
  }

  // Show reference measurement screen if active
  if (showReferenceMeasurement) {
    return <ReferenceMeasurement onBack={handleBackFromReferenceMeasurement} onNext={handleReferenceMeasurementNext} />;
  }

  // Show calibration complete screen if active
  if (showCalibrationComplete) {
    return <CalibrationComplete onComplete={handleCalibrationComplete} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Background circles */}
      <View style={styles.backgroundCircles}>
        <CirclesSvg
          width={width}
          height={356}
          style={styles.circlesImage}
        />
      </View>

      {/* Settings/About Button */}
      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
              stroke="#4A90E2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Path
              d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2569 9.77251 19.9859C9.5799 19.7148 9.31074 19.5063 9 19.38C8.69838 19.2469 8.36381 19.2072 8.03941 19.266C7.71502 19.3248 7.41568 19.4795 7.18 19.71L7.12 19.77C6.93425 19.956 6.71368 20.1035 6.47088 20.2041C6.22808 20.3048 5.96783 20.3566 5.705 20.3566C5.44217 20.3566 5.18192 20.3048 4.93912 20.2041C4.69632 20.1035 4.47575 19.956 4.29 19.77C4.10405 19.5843 3.95653 19.3637 3.85588 19.1209C3.75523 18.8781 3.70343 18.6178 3.70343 18.355C3.70343 18.0922 3.75523 17.8319 3.85588 17.5891C3.95653 17.3463 4.10405 17.1257 4.29 16.94L4.35 16.88C4.58054 16.6443 4.73519 16.345 4.794 16.0206C4.85282 15.6962 4.81312 15.3616 4.68 15.06C4.55324 14.7642 4.34276 14.512 4.07447 14.3343C3.80618 14.1566 3.49179 14.0613 3.17 14.06H3C2.46957 14.06 1.96086 13.8493 1.58579 13.4742C1.21071 13.0991 1 12.5904 1 12.06C1 11.5296 1.21071 11.0209 1.58579 10.6458C1.96086 10.2707 2.46957 10.06 3 10.06H3.09C3.42099 10.0523 3.742 9.94512 4.01309 9.75251C4.28417 9.5599 4.49268 9.29074 4.62 8.98C4.75312 8.67838 4.79282 8.34381 4.734 8.01941C4.67519 7.69502 4.52054 7.39568 4.29 7.16L4.23 7.1C4.04405 6.91425 3.89653 6.69368 3.79588 6.45088C3.69523 6.20808 3.64343 5.94783 3.64343 5.685C3.64343 5.42217 3.69523 5.16192 3.79588 4.91912C3.89653 4.67632 4.04405 4.45575 4.23 4.27C4.41575 4.08405 4.63632 3.93653 4.87912 3.83588C5.12192 3.73523 5.38217 3.68343 5.645 3.68343C5.90783 3.68343 6.16808 3.73523 6.41088 3.83588C6.65368 3.93653 6.87425 4.08405 7.06 4.27L7.12 4.33C7.35568 4.56054 7.65502 4.71519 7.97941 4.774C8.30381 4.83282 8.63838 4.79312 8.94 4.66H9C9.29577 4.53324 9.54802 4.32276 9.72569 4.05447C9.90337 3.78618 9.99872 3.47179 10 3.15V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
              stroke="#4A90E2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.titleText}>How is your blood</Text>
        <Text style={styles.titleText}>pressure today?</Text>

        {/* Main Measure Button */}
        <View style={styles.measureButtonContainer}>
          <TouchableOpacity 
            style={[
              styles.measureButton, 
              !areStoredOffsetsValid && styles.inactiveMeasureButton
            ]} 
            onPress={handleMeasure}
            disabled={isRequestingPermissions || !areStoredOffsetsValid}
          >
            {isRequestingPermissions ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <>
                <PhoneIconSvg
                  width={40}
                  height={40}
                  style={styles.phoneIcon}
                />
                <Text style={[
                  styles.measureText,
                  !areStoredOffsetsValid && styles.inactiveMeasureText
                ]}>
                  Measure
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Calibration messages */}
          {!areStoredOffsetsValid ? (
            <Text style={styles.calibrationMessage}>
              Please calibrate your device before measuring
            </Text>
          ) : (
            <Text style={styles.calibrationStatusMessage}>
              {getCalibrationStatusMessage()}
            </Text>
          )}
        </View>

        {/* Results and Reference Buttons Row */}
        <View style={styles.buttonsRow}>
          {/* Results Button */}
          <TouchableOpacity 
            style={styles.resultsButton} 
            onPress={handleResults}
            disabled={isRequestingPermissions}
          >
            {isRequestingPermissions ? (
              <ActivityIndicator size="small" color="#4A90E2" />
            ) : (
              <>
                <Text style={styles.resultsButtonText}>Results</Text>
                <ResultsSvg
                  width={40}
                  height={40}
                  style={styles.resultsButtonImage}
                />
              </>
            )}
          </TouchableOpacity>

          {/* Calibrate Button */}
          <TouchableOpacity style={styles.referenceButton} onPress={handleReference}>
            <Text style={styles.referenceButtonText}>Calibrate</Text>
            <ReferenceMeasurementSvg
              width={40}
              height={40}
              style={styles.referenceButtonImage}
            />
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
  backgroundCircles: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 356,
  },
  circlesImage: {
    width: '100%',
    height: '100%',
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
    alignItems: 'center',
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
    marginBottom: 10,
  },
  measureText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  inactiveMeasureButton: {
    backgroundColor: '#B0B0B0',
    opacity: 0.7,
  },
  inactiveMeasureText: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  calibrationMessage: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  calibrationStatusMessage: {
    fontSize: 14,
    color: '#4A90E2',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 15,
  },
  resultsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
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
    maxWidth: 160,
  },
  resultsButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    lineHeight: 18,
  },
  resultsButtonImage: {
    marginLeft: 12,
  },
  referenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#4A90E2',
    maxWidth: 160,
  },
  referenceButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    lineHeight: 18,
  },
  referenceButtonImage: {
    marginLeft: 12,
  },
  settingsContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default Home;
