/**
 * PrivacyScreen Component
 * Privacy settings page for the Riva.Digital app
 *
 * @format
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import HealthService from '../../services/HealthService';

interface PrivacyScreenProps {
  onBack: () => void;
  onTermsAndConditions: () => void;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onBack, onTermsAndConditions }) => {
  const [isRequestingHealthPermissions, setIsRequestingHealthPermissions] = useState(false);

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

  const handleAppleHealth = async () => {
    try {
      const permissionGranted = await HealthService.requestPermissions(setIsRequestingHealthPermissions);
      
      if (permissionGranted) {
        Alert.alert(
          'Apple Health Access Granted',
          'You have successfully granted access to Apple Health. The app can now save your blood pressure and heart rate measurements.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Apple Health Access Required',
          'Apple Health access is required to save your blood pressure and heart rate measurements. You can enable this in your device settings.',
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
      }
    } catch (error) {
      console.error('Error requesting Apple Health permissions:', error);
      setIsRequestingHealthPermissions(false);
      Alert.alert(
        'Permission Error',
        'Failed to request Apple Health permissions. Please try again.',
        [{ text: 'OK' }]
      );
    }
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

  return (
    <SafeAreaView style={styles.container}>
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
            disabled={isRequestingHealthPermissions}
          >
            <Text style={styles.settingsItemText}>Sync with Apple Health</Text>
            {isRequestingHealthPermissions ? (
              <ActivityIndicator size="small" color="#4A90E2" />
            ) : (
              <ChevronIcon />
            )}
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Enable Camera */}
          <TouchableOpacity style={styles.settingsItem} onPress={handleEnableCamera}>
            <Text style={styles.settingsItemText}>Enable Camera</Text>
            <ChevronIcon />
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Terms and Conditions */}
          <TouchableOpacity style={styles.settingsItem} onPress={handleTermsAndConditions}>
            <Text style={styles.settingsItemText}>Terms and Conditions</Text>
            <ChevronIcon />
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f7fa',
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
    marginHorizontal: 0,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#C6C6C8',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    backgroundColor: '#FFFFFF',
  },
  settingsItemText: {
    fontSize: 17,
    color: '#4A90E2',
    flex: 1,
  },
  separator: {
    height: 0.5,
    backgroundColor: '#C6C6C8',
    marginLeft: 16,
  },
});

export default PrivacyScreen;
