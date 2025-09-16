/**
 * Onboarding Screen Component
 * Shows the onboarding flow for first-time users
 *
 * @format
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import BloodDropSvg from '../../../assets/blood-drop.svg';
import BloodPressureSvg from '../../../assets/blood-pressure.svg';
import HeartSvg from '../../../assets/heart.svg';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const steps = [
    {
      title: 'Why is it important?',
      description: 'Cardiovascular disease is the leading cause of death and disability world-wide. Blood pressure, throughout the range seen in developed countries, is the most important risk factor for cardiovascular disease.',
      icon: BloodDropSvg,
    },
    {
      title: 'How can I measure?',
      description: 'Measuring the blood pressure is normally quite cumbersome. Now it\'s as easy as placing your finger on a smartphone camera – quite literally. Measure regularly and you know what you are at.',
      icon: BloodPressureSvg,
    },
    {
      title: 'When can I start?',
      description: 'Participate in the Riva challenge and know your blood pressure. Observe what you do during the day and how your heart reacts to it.',
      icon: HeartSvg,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollViewRef.current?.scrollTo({
        x: nextStep * width,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newStep = Math.round(contentOffsetX / width);
    if (newStep !== currentStep && newStep >= 0 && newStep < steps.length) {
      setCurrentStep(newStep);
    }
  };

  const renderProgressDots = () => {
    return (
      <View style={styles.progressContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderIcon = (IconComponent: any) => {
    return (
      <IconComponent
        width={120}
        height={120}
        style={styles.iconImage}
      />
    );
  };

  const renderStep = (step: any, index: number) => {
    return (
      <View key={index} style={styles.stepContainer}>
        <Text style={styles.title}>{step.title}</Text>
        
        <View style={styles.iconContainer}>
          {renderIcon(step.icon)}
        </View>
        
        <Text style={styles.description}>{step.description}</Text>
        
        {index === steps.length - 1 ? (
          <TouchableOpacity style={styles.startButton} onPress={handleNext}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background waves */}
      <View style={styles.backgroundWaves}>
        <Svg width={width} height={200} viewBox={`0 0 ${width} 200`} style={styles.topWave}>
          <Path
            d={`M0,100 Q${width/4},80 ${width/2},100 T${width},100 L${width},0 L0,0 Z`}
            fill="#E8F4FD"
          />
        </Svg>
        <Svg width={width} height={200} viewBox={`0 0 ${width} 200`} style={styles.bottomWave}>
          <Path
            d={`M0,100 Q${width/4},120 ${width/2},100 T${width},100 L${width},200 L0,200 Z`}
            fill="#E8F4FD"
          />
        </Svg>
      </View>

      <View style={styles.progressContainer}>
        {renderProgressDots()}
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {steps.map((step, index) => renderStep(step, index))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundWaves: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topWave: {
    position: 'absolute',
    top: 0,
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
  },
  stepContainer: {
    width: width,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 15,
  },
  activeDot: {
    backgroundColor: '#4A90E2',
  },
  inactiveDot: {
    backgroundColor: '#D1E7FF',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    width: '100%',
  },
  iconImage: {
    // SVG component will handle its own dimensions
  },
  description: {
    fontSize: 16,
    color: '#8FA8B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  nextButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 18,
    paddingHorizontal: 80,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: width * 0.8,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default OnboardingScreen;
