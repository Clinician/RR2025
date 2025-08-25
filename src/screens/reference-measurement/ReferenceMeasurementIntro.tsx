import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Ellipse,
  G,
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const ReferenceMeasurementIntro: React.FC = () => {
  const handleStart = () => {
    // Navigate to next screen
    console.log('Start pressed');
  };

  const handleBack = () => {
    // Navigate back
    console.log('Back pressed');
  };

  const ProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressDot, styles.activeDot]} />
      <View style={styles.progressLine} />
      <View style={styles.progressDot} />
      <View style={styles.progressLine} />
      <View style={styles.progressDot} />
    </View>
  );

  const IllustrationSvg = () => (
    <Svg width={width * 0.6} height={height * 0.25} viewBox="0 0 300 200">
      {/* Phone */}
      <Rect
        x="180"
        y="40"
        width="80"
        height="120"
        rx="15"
        fill="#E8F4FD"
        stroke="#007AFF"
        strokeWidth="2"
      />
      <Rect
        x="185"
        y="50"
        width="70"
        height="100"
        rx="5"
        fill="white"
      />
      
      {/* Heart icon on phone */}
      <Path
        d="M210 80 C205 75, 195 75, 200 85 C205 75, 215 75, 210 80 Z"
        fill="#FF6B6B"
      />
      
      {/* Blood pressure device */}
      <Rect
        x="40"
        y="60"
        width="60"
        height="80"
        rx="8"
        fill="#007AFF"
      />
      
      {/* Device screen */}
      <Rect
        x="50"
        y="70"
        width="40"
        height="25"
        rx="3"
        fill="white"
      />
      
      {/* Connection cable */}
      <Path
        d="M100 100 Q140 90, 180 100"
        stroke="#007AFF"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Pressure gauge */}
      <Circle
        cx="120"
        cy="130"
        r="20"
        fill="white"
        stroke="#007AFF"
        strokeWidth="2"
      />
      <Path
        d="M115 125 L125 135"
        stroke="#FF6B6B"
        strokeWidth="2"
      />
      
      {/* Blue circle element */}
      <Circle
        cx="160"
        cy="160"
        r="15"
        fill="#007AFF"
      />
    </Svg>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Measurement by your phone</Text>
        
        <ProgressIndicator />

        <Text style={styles.title}>
          Reference{'\n'}measurements improve{'\n'}accuracy
        </Text>

        <Text style={styles.description}>
          A reference measurement will help the{'\n'}
          algorithm to get to know your levels better and{'\n'}
          become more accurate
        </Text>

        <View style={styles.illustrationContainer}>
          <IllustrationSvg />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Start</Text>
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
    marginBottom: 20,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default ReferenceMeasurementIntro;
