/**
 * CalculatingResultsScreen Component
 * Screen displayed while calculating blood pressure results
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface CalculatingResultsScreenProps {
  onComplete: () => void;
}

const CalculatingResultsScreen: React.FC<CalculatingResultsScreenProps> = ({ onComplete }) => {
  const [animatedValues] = useState([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]);

  useEffect(() => {
    // Start the loading animation
    const animateLoading = () => {
      const animations = animatedValues.map((animatedValue, index) => 
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.loop(
            Animated.sequence([
              Animated.timing(animatedValue, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.timing(animatedValue, {
                toValue: 0.3,
                duration: 600,
                useNativeDriver: true,
              }),
            ])
          ),
        ])
      );

      Animated.parallel(animations).start();
    };

    animateLoading();

    // Auto-advance to results after 3 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer);
      animatedValues.forEach(animatedValue => animatedValue.stopAnimation());
    };
  }, [animatedValues, onComplete]);

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
        <Text style={styles.title}>Calculating Results</Text>

        {/* Loading dots */}
        <View style={styles.loadingContainer}>
          {animatedValues.map((animatedValue, index) => (
            <Animated.View
              key={index}
              style={[
                styles.loadingDot,
                {
                  opacity: animatedValue,
                  transform: [
                    {
                      scale: animatedValue.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [0.8, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Info section - Fixed at bottom */}
      <View style={styles.infoContainer}>
        <View style={styles.infoIcon}>
          <Text style={styles.infoIconText}>💡</Text>
        </View>
        <Text style={styles.infoText}>
          Croup is an inflammation of the larynx, trachea and{'\n'}
          bronchi. It affects the voice box.
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 80,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 120,
  },
  loadingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4A90E2',
    marginHorizontal: 8,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  infoIcon: {
    marginBottom: 15,
  },
  infoIconText: {
    fontSize: 24,
  },
  infoText: {
    fontSize: 16,
    color: '#4A90E2',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default CalculatingResultsScreen;
