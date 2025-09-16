import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MeasurementType } from '../../contexts/CalibrationContext';

const { width, height } = Dimensions.get('window');

interface ReferenceMeasurementProps {
  onBack: () => void;
  onNext: (systolic: number, diastolic: number, measurementType: MeasurementType) => void;
}

const ReferenceMeasurement: React.FC<ReferenceMeasurementProps> = ({ onBack, onNext }) => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [measurementType, setMeasurementType] = useState<MeasurementType>('expert');
  const systolicInputRef = useRef<TextInput>(null);
  const diastolicInputRef = useRef<TextInput>(null);

  const handleNext = () => {
    const systolicValue = parseInt(systolic, 10);
    const diastolicValue = parseInt(diastolic, 10);

    // Validation
    if (!systolic || !diastolic) {
      Alert.alert('Missing Values', 'Please enter both systolic and diastolic values.');
      return;
    }

    if (isNaN(systolicValue) || isNaN(diastolicValue)) {
      Alert.alert('Invalid Values', 'Please enter valid numeric values.');
      return;
    }

    if (systolicValue < 70 || systolicValue > 250) {
      Alert.alert('Invalid Systolic', 'Systolic pressure should be between 70 and 250 mmHg.');
      return;
    }

    if (diastolicValue < 40 || diastolicValue > 150) {
      Alert.alert('Invalid Diastolic', 'Diastolic pressure should be between 40 and 150 mmHg.');
      return;
    }

    if (systolicValue <= diastolicValue) {
      Alert.alert('Invalid Values', 'Systolic pressure should be higher than diastolic pressure.');
      return;
    }

    onNext(systolicValue, diastolicValue, measurementType);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                d="M19 12H5M12 19L5 12L12 5"
                stroke="#4A90E2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Measurement with medical device</Text>
          <View style={styles.progressDots}>
            <View style={styles.dot} />
            <View style={[styles.progressLine, styles.activeProgressLine]} />
            <View style={[styles.dot, styles.activeDot]} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.titleText}>
            {measurementType === 'expert' ? 'Let an expert measure' : 'Measure your own'}
          </Text>
          <Text style={styles.titleText}>your blood pressure</Text>

          <Text style={styles.descriptionText}>
            {measurementType === 'expert' 
              ? 'Use a medically approved device for this step'
              : 'Use your home blood pressure monitor'
            }
          </Text>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Enter measurement results</Text>

            {/* Systolic Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Systolic</Text>
              <TextInput
                ref={systolicInputRef}
                style={styles.input}
                value={systolic}
                onChangeText={setSystolic}
                placeholder="0"
                placeholderTextColor="#C7C7CC"
                keyboardType="numeric"
                maxLength={3}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {/* Diastolic Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Diastolic</Text>
              <TextInput
                ref={diastolicInputRef}
                style={styles.input}
                value={diastolic}
                onChangeText={setDiastolic}
                placeholder="0"
                placeholderTextColor="#C7C7CC"
                keyboardType="numeric"
                maxLength={3}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {/* Expert/At home toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[
                  styles.toggleButton, 
                  measurementType === 'expert' && styles.activeToggle
                ]}
                onPress={() => setMeasurementType('expert')}
              >
                <Text style={[
                  styles.toggleText, 
                  measurementType === 'expert' && styles.activeToggleText
                ]}>
                  Expert
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.toggleButton, 
                  measurementType === 'home' && styles.activeToggle
                ]}
                onPress={() => setMeasurementType('home')}
              >
                <Text style={[
                  styles.toggleText, 
                  measurementType === 'home' && styles.activeToggleText
                ]}>
                  At home
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.helperText}>
              {measurementType === 'expert' 
                ? 'Measurement done by a doctor, nurse, or pharmacist'
                : 'Use your personal blood pressure monitor'
              }
            </Text>
          </View>

          {/* Next Button */}
          <TouchableOpacity 
            style={[
              styles.nextButton,
              (!systolic || !diastolic) && styles.nextButtonDisabled
            ]} 
            onPress={handleNext}
            disabled={!systolic || !diastolic}
          >
            <Text style={[
              styles.nextButtonText,
              (!systolic || !diastolic) && styles.nextButtonTextDisabled
            ]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    marginLeft: 8,
    fontWeight: '500',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
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
  descriptionText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 20,
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#FFFFFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#4A90E2',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16,
  },
  nextButton: {
    width: width * 0.8,
    height: 56,
    backgroundColor: '#4A90E2',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E5EA',
    shadowOpacity: 0,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: '#8E8E93',
  },
});

export default ReferenceMeasurement;
