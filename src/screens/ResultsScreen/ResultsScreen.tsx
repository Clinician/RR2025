import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import HealthService from '../../services/HealthService';
import { useCalibration } from '../../contexts/CalibrationContext';

interface ResultsScreenProps {
  onBack: () => void;
  onSave?: () => void;
  onCalibrate?: () => void;
  onCalibrationComplete?: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ onBack, onSave, onCalibrate, onCalibrationComplete }) => {
  const { isCalibrationMode, referenceMeasurement, setCalibrationOffset } = useCalibration();
  // Dummy values as requested: 75 BPM heart rate, 130/90 mmHg blood pressure
  const systolic = 130;
  const diastolic = 90;
  const heartRate = 75;
  const timestamp = new Date();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    
    // If in calibration mode, complete calibration instead of saving to Health
    if (isCalibrationMode && referenceMeasurement) {
      try {
        // Calculate calibration offset between reference and measured values
        const systolicOffset = referenceMeasurement.systolic - systolic;
        const diastolicOffset = referenceMeasurement.diastolic - diastolic;
        
        // Store the calibration offset
        setCalibrationOffset({
          systolicOffset,
          diastolicOffset,
          timestamp: new Date(),
        });
        
        console.log('Calibration completed:', {
          reference: referenceMeasurement,
          measured: { systolic, diastolic },
          offset: { systolicOffset, diastolicOffset },
        });
        
        // Navigate to calibration complete screen
        onCalibrationComplete?.();
      } catch (error) {
        console.error('Error completing calibration:', error);
        Alert.alert(
          'Calibration Error',
          'An error occurred while completing calibration.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsSaving(false);
      }
      return;
    }
    
    // Normal flow: save to Apple Health
    try {
      // Request HealthKit permissions if not already granted
      const hasPermissions = await HealthService.requestPermissions();
      
      if (!hasPermissions) {
        Alert.alert(
          'Health Access Required',
          'Please grant access to Health app to save your measurements.',
          [{ text: 'OK' }]
        );
        setIsSaving(false);
        return;
      }
      
      // Save vital signs to Apple Health
      const success = await HealthService.saveVitalSigns(heartRate, systolic, diastolic);
      
      if (success) {
        Alert.alert(
          'Success',
          'Your measurements have been saved to Apple Health.',
          [
            {
              text: 'OK',
              onPress: () => {
                onSave?.();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Save Failed',
          'Unable to save measurements to Apple Health. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Error saving to Health:', error);
      Alert.alert(
        'Error',
        'An error occurred while saving to Apple Health.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.retryButton} onPress={onBack}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Result</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Blood Pressure Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartArea}>
            {/* Y-axis labels */}
            <View style={styles.yAxisLabels}>
              {[140, 130, 120, 110, 100, 90, 80, 70].map((value) => (
                <Text key={value} style={styles.yAxisLabel}>{value}</Text>
              ))}
            </View>
            
            {/* Chart SVG */}
            <View style={styles.chartSvg}>
              <Svg width={80} height={280} viewBox="0 0 80 280">
                {/* Grid lines */}
                {[0, 40, 80, 120, 160, 200, 240, 280].map((y, index) => (
                  <Line
                    key={index}
                    x1="0"
                    y1={y}
                    x2="80"
                    y2={y}
                    stroke="#E5E5E5"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Blood pressure bar */}
                <Circle cx="40" cy="40" r="8" fill="#00D4AA" stroke="#FFFFFF" strokeWidth="3" />
                <Line x1="40" y1="48" x2="40" y2="200" stroke="#00D4AA" strokeWidth="16" />
                <Circle cx="40" cy="200" r="8" fill="#00D4AA" stroke="#FFFFFF" strokeWidth="3" />
              </Svg>
            </View>
          </View>
          
          {/* Time and date */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(timestamp)}</Text>
            <Text style={styles.dateText}>{formatDate(timestamp)}</Text>
          </View>
        </View>

        {/* Readings */}
        <View style={styles.readingsContainer}>
          <View style={styles.reading}>
            <Text style={styles.readingValue}>{systolic}</Text>
            <Text style={styles.readingLabel}>sys</Text>
          </View>
          
          <View style={styles.reading}>
            <Text style={styles.readingValue}>{diastolic}</Text>
            <Text style={styles.readingLabel}>Dia</Text>
          </View>
          
          <View style={styles.heartRateContainer}>
            <Text style={styles.heartRateValue}>{heartRate} ♥</Text>
          </View>
        </View>

        {/* Status indicator */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Your blood pressure is normal</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving 
                ? (isCalibrationMode ? 'Completing...' : 'Saving...') 
                : (isCalibrationMode ? 'Complete Calibration' : 'Save')
              }
            </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  retryButtonText: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  yAxisLabels: {
    justifyContent: 'space-between',
    height: 280,
    marginRight: 10,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    width: 30,
  },
  chartSvg: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    color: '#999',
  },
  readingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
  },
  reading: {
    alignItems: 'center',
  },
  readingValue: {
    fontSize: 48,
    color: '#00D4AA',
    fontWeight: '300',
  },
  readingLabel: {
    fontSize: 16,
    color: '#00D4AA',
    fontWeight: '500',
  },
  heartRateContainer: {
    alignItems: 'center',
  },
  heartRateValue: {
    fontSize: 24,
    color: '#4A90E2',
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: '#00D4AA',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  warningIcon: {
    marginRight: 10,
  },
  warningIconText: {
    fontSize: 20,
    color: '#FF6B6B',
  },
  warningTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#FF6B6B',
    lineHeight: 18,
  },
  calibrateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  calibrateButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 40,
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 40,
    flex: 1,
    marginLeft: 10,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#B0B0B0',
    opacity: 0.6,
  },
});

export default ResultsScreen;
