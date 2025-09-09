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

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.settingsItemText}>Privacy</Text>
            <ChevronIcon />
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separator} />

          {/* About */}
          <TouchableOpacity style={styles.settingsItem} onPress={onAbout}>
            <Text style={styles.settingsItemText}>About</Text>
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
    color: '#000',
    flex: 1,
  },
  separator: {
    height: 0.5,
    backgroundColor: '#C6C6C8',
    marginLeft: 16,
  },
});

export default SettingsScreen;
