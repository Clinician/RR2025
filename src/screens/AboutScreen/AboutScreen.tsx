/**
 * AboutScreen Component
 * About page for the Riva.Digital app
 *
 * @format
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Linking,
  ImageBackground,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface AboutScreenProps {
  onBack: () => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  const handleMoreAboutRiva = () => {
    // You can replace this URL with the actual Riva.Digital website
    Linking.openURL('https://riva.digital').catch(err => 
      console.error('Failed to open URL:', err)
    );
  };

  const RivaLogo = () => (
    <Svg width={80} height={80} viewBox="0 0 100 100">
      <Path
        d="M50 10 C70 10, 85 25, 85 45 C85 65, 70 80, 50 80 C30 80, 15 65, 15 45 C15 25, 30 10, 50 10 Z"
        fill="none"
        stroke="#4A90E2"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M35 35 Q50 25, 65 35 Q50 45, 35 35"
        fill="none"
        stroke="#4A90E2"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M50 45 L50 65"
        stroke="#4A90E2"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground 
        source={require('../../../assets/wavesSettingsBack.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M15 18L9 12L15 6"
              stroke="#4A90E2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
          <Text style={styles.backButtonText}>Settings</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <RivaLogo />
        </View>

        {/* Title */}
        <Text style={styles.title}>About Riva.Digital</Text>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.companyName}>Riva.Digital</Text>
          <Text style={styles.tagline}> - Making Switzerland Fit</Text>
        </View>

        <Text style={styles.description}>
          Every fifth Swiss is affected by hypertension. Our app is created to fight a hypertension and incentivize people to achieve and maintain a healthy lifestyle.
        </Text>

        <Text style={styles.subtitle}>
          Get to know your heart - it's worth it.
        </Text>

        {/* More about link */}
        <TouchableOpacity style={styles.moreAboutButton} onPress={handleMoreAboutRiva}>
          <Text style={styles.moreAboutText}>More about Riva.Digital</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by </Text>
        <Text style={styles.footerBrand}>Altran & Pryv</Text>
      </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButtonText: {
    fontSize: 17,
    color: '#4A90E2',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  logoContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 40,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  companyName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 17,
    color: '#000',
    textAlign: 'center',
  },
  description: {
    fontSize: 17,
    color: '#000',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 17,
    color: '#000',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 40,
  },
  moreAboutButton: {
    paddingVertical: 8,
  },
  moreAboutText: {
    fontSize: 17,
    color: '#4A90E2',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  footerBrand: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '500',
  },
});

export default AboutScreen;
