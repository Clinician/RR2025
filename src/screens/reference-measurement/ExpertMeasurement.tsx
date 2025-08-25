import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  SafeAreaView,
} from 'react-native';

const { width } = Dimensions.get('window');

const ExpertMeasurement: React.FC = () => {
  const [systolic, setSystolic] = useState('0');
  const [diastolic, setDiastolic] = useState('0');
  const [measurementType, setMeasurementType] = useState<'expert' | 'home'>('expert');

  const handleNext = () => {
    // Navigate to next screen
    console.log('Next pressed', { systolic, diastolic, measurementType });
  };

  const handleBack = () => {
    // Navigate back
    console.log('Back pressed');
  };

  const ProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressDot} />
      <View style={styles.progressLine} />
      <View style={[styles.progressDot, styles.activeDot]} />
      <View style={styles.progressLine} />
      <View style={styles.progressDot} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Measurement with medical device</Text>
        
        <ProgressIndicator />

        <Text style={styles.title}>
          Let an expert measure{'\n'}your blood pressure
        </Text>

        <Text style={styles.description}>
          Use a medically approved device for this step
        </Text>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Enter measurement results</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Systolic</Text>
            <TextInput
              style={styles.input}
              value={systolic}
              onChangeText={setSystolic}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Diastolic</Text>
            <TextInput
              style={styles.input}
              value={diastolic}
              onChangeText={setDiastolic}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                measurementType === 'expert' && styles.activeToggle,
              ]}
              onPress={() => setMeasurementType('expert')}
            >
              <Text
                style={[
                  styles.toggleText,
                  measurementType === 'expert' && styles.activeToggleText,
                ]}
              >
                Expert
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                measurementType === 'home' && styles.activeToggle,
              ]}
              onPress={() => setMeasurementType('home')}
            >
              <Text
                style={[
                  styles.toggleText,
                  measurementType === 'home' && styles.activeToggleText,
                ]}
              >
                At home
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            Measurement done by a doctor, nurse, or pharmacist
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 17,
    color: '#007AFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
  },
  activeDot: {
    backgroundColor: '#007AFF',
  },
  progressLine: {
    width: 30,
    height: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    flex: 1,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 17,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    fontSize: 24,
    color: '#1C1C1E',
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 15,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeToggleText: {
    color: 'white',
  },
  disclaimer: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default ExpertMeasurement;
