import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const LogoIcon = () => (
  <Svg width={120} height={120} viewBox="0 0 120 120">
    <Defs>
      <LinearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#4A90E2" />
        <Stop offset="100%" stopColor="#357ABD" />
      </LinearGradient>
      <LinearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FF6B9D" />
        <Stop offset="100%" stopColor="#E55A8A" />
      </LinearGradient>
    </Defs>
    
    {/* Outer blue arc */}
    <Path
      d="M 20 60 A 40 40 0 1 1 100 60"
      stroke="url(#blueGradient)"
      strokeWidth="8"
      fill="none"
      strokeLinecap="round"
    />
    
    {/* Inner blue arc */}
    <Path
      d="M 30 60 A 30 30 0 1 1 90 60"
      stroke="url(#blueGradient)"
      strokeWidth="6"
      fill="none"
      strokeLinecap="round"
    />
    
    {/* Pink heartbeat line */}
    <Path
      d="M 25 75 L 35 75 L 40 55 L 50 95 L 60 35 L 70 75 L 95 75"
      stroke="url(#pinkGradient)"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Small blue circle */}
    <Circle cx="105" cy="45" r="4" fill="url(#blueGradient)" />
  </Svg>
);

const WaveBackground = () => (
  <Svg
    width={width}
    height={height * 0.4}
    viewBox={`0 0 ${width} ${height * 0.4}`}
    style={styles.waveBackground}
  >
    <Defs>
      <LinearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#E3F2FD" stopOpacity="0.3" />
        <Stop offset="50%" stopColor="#BBDEFB" stopOpacity="0.5" />
        <Stop offset="100%" stopColor="#90CAF9" stopOpacity="0.7" />
      </LinearGradient>
    </Defs>
    
    <Path
      d={`M 0 ${height * 0.15} 
          Q ${width * 0.25} ${height * 0.1} ${width * 0.5} ${height * 0.15}
          T ${width} ${height * 0.15}
          L ${width} ${height * 0.4}
          L 0 ${height * 0.4}
          Z`}
      fill="url(#waveGradient)"
    />
    
    <Path
      d={`M 0 ${height * 0.2} 
          Q ${width * 0.3} ${height * 0.15} ${width * 0.6} ${height * 0.2}
          T ${width} ${height * 0.2}
          L ${width} ${height * 0.4}
          L 0 ${height * 0.4}
          Z`}
      fill="url(#waveGradient)"
      opacity="0.6"
    />
  </Svg>
);

const WelcomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Main content */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <LogoIcon />
        </View>
        
        {/* Main title */}
        <Text style={styles.mainTitle}>oBPM</Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>PROUD PARTNER OF RIVA.DIGITAL</Text>
      </View>
      
      {/* Wave background at bottom */}
      <WaveBackground />
      
      {/* Footer text */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Altran & Pryv</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 2,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7F8C8D',
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  waveBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  footerText: {
    fontSize: 14,
    color: '#95A5A6',
    fontWeight: '400',
  },
});

export default WelcomeScreen;
