/**
 * PrivacyScreen Component
 * Privacy settings page for the Riva.Digital app
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
  Alert,
  Linking,
  ImageBackground,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PrivacyScreenProps {
  onBack: () => void;
  onTermsAndConditions: () => void;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onBack, onTermsAndConditions }) => {

  const handleEnableCamera = () => {
    Alert.alert(
      'Camera Access',
      'Camera access is required for blood pressure measurements. You can manage this permission in your device settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Settings',
          onPress: () => {
            Linking.openURL('app-settings:').catch(() => {
              Alert.alert('Error', 'Unable to open settings');
            });
          },
        },
      ]
    );
  };

  const handleAppleHealth = () => {
    Alert.alert(
      'Apple Health Access',
      'Apple Health access is required to save your blood pressure and heart rate measurements. To enable/disable Health permissions, go to the Health app → Data Access & Devices → riva.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Settings',
          onPress: () => {
            Linking.openURL('app-settings:').catch(() => {
              Alert.alert('Error', 'Unable to open settings');
            });
          },
        },
      ]
    );
  };

  const handleTermsAndConditions = () => {
    onTermsAndConditions();
  };

  const BackIcon = () => (
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
  );

  const ChevronIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M9 18L15 12L9 6"
        stroke="#C7C7CC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );

  const HealthIcon = () => (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="#4A90E2"
      />
    </Svg>
  );

  const CameraIcon = () => (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11z"
        stroke="#4A90E2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
        stroke="#4A90E2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );

  const DocumentIcon = () => (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke="#4A90E2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M14 2v6h6"
        stroke="#4A90E2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M16 13H8"
        stroke="#4A90E2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M16 17H8"
        stroke="#4A90E2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M10 9H8"
        stroke="#4A90E2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
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
            <BackIcon />
            <Text style={styles.backButtonText}>Settings</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Settings List */}
          <View style={styles.settingsList}>
            {/* Apple Health */}
            <TouchableOpacity 
              style={styles.settingsItem} 
              onPress={handleAppleHealth}
            >
              <View style={styles.settingsItemLeft}>
                <View style={styles.iconContainer}>
                  <HealthIcon />
                </View>
                <Text style={styles.settingsItemText}>Enable Apple Health</Text>
              </View>
              <ChevronIcon />
            </TouchableOpacity>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Enable Camera */}
            <TouchableOpacity style={styles.settingsItem} onPress={handleEnableCamera}>
              <View style={styles.settingsItemLeft}>
                <View style={styles.iconContainer}>
                  <CameraIcon />
                </View>
                <Text style={styles.settingsItemText}>Enable Camera</Text>
              </View>
              <ChevronIcon />
            </TouchableOpacity>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Terms and Conditions */}
            <TouchableOpacity style={styles.settingsItem} onPress={handleTermsAndConditions}>
              <View style={styles.settingsItemLeft}>
                <View style={styles.iconContainer}>
                  <DocumentIcon />
                </View>
                <Text style={styles.settingsItemText}>Terms and Conditions</Text>
              </View>
              <ChevronIcon />
            </TouchableOpacity>
          </View>
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
    paddingTop: 20,
  },
  settingsList: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
    backgroundColor: 'transparent',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsItemText: {
    fontSize: 17,
    color: '#000',
    flex: 1,
  },
  separator: {
    height: 0.5,
    backgroundColor: '#E5E5E7',
    marginLeft: 60,
  },
});

export default PrivacyScreen;
