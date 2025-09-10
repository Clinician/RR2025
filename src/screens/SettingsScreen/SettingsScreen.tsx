/**
 * SettingsScreen Component
 * Main settings page for the Riva.Digital app
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
  Image,
  ImageBackground,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SettingsScreenProps {
  onBack: () => void;
  onAbout: () => void;
  onPrivacy: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onAbout, onPrivacy }) => {
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

  const PrivacyIcon = () => (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="#4A90E2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );

  const AboutIcon = () => (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
        fill="#4A90E2"
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
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Settings List */}
          <View style={styles.settingsList}>
            {/* Privacy */}
            <TouchableOpacity style={styles.settingsItem} onPress={onPrivacy}>
              <View style={styles.settingsItemLeft}>
                <View style={styles.iconContainer}>
                  <PrivacyIcon />
                </View>
                <Text style={styles.settingsItemText}>Privacy</Text>
              </View>
              <ChevronIcon />
            </TouchableOpacity>

            {/* Separator */}
            <View style={styles.separator} />

            {/* About */}
            <TouchableOpacity style={styles.settingsItem} onPress={onAbout}>
              <View style={styles.settingsItemLeft}>
                <View style={styles.iconContainer}>
                  <AboutIcon />
                </View>
                <Text style={styles.settingsItemText}>About</Text>
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

export default SettingsScreen;
