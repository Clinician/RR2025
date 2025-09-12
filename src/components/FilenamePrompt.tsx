/**
 * FilenamePrompt Component
 * Modal component for prompting user to enter a filename for saving PPG data
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';

interface FilenamePromptProps {
  visible: boolean;
  onShare: (filename: string) => void;
  onCancel: () => void;
  title?: string;
  placeholder?: string;
}

const FilenamePrompt: React.FC<FilenamePromptProps> = ({
  visible,
  onShare,
  onCancel,
  title = 'Upload PPG Data to iCloud',
  placeholder = 'Enter filename...',
}) => {
  const [filename, setFilename] = useState('');

  // Generate default filename with device model and timestamp
  const generateDefaultFilename = async (): Promise<string> => {
    try {
      console.log('Generating default filename...');
      
      // Get device model with timeout to prevent hanging
      const deviceModelPromise = DeviceInfo.getModel();
      const timeoutPromise = new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Device info timeout')), 2000)
      );
      
      const deviceModel = await Promise.race([deviceModelPromise, timeoutPromise]);
      console.log('Device model retrieved:', deviceModel);
      
      const now = new Date();
      
      // Format timestamp as YYYY-MM-DD_HH-MM-SS
      const timestamp = now.toISOString()
        .replace(/T/, '_')
        .replace(/:/g, '-')
        .substring(0, 19); // Remove milliseconds and timezone
      
      // Clean device model (remove spaces and special characters, keep only alphanumeric)
      const cleanModel = deviceModel.replace(/[^a-zA-Z0-9]/g, '');
      console.log('Clean model:', cleanModel);
      
      const filename = `${cleanModel}_${timestamp}`;
      console.log('Generated filename:', filename);
      
      return filename;
    } catch (error) {
      console.error('Error generating default filename:', error);
      // Fallback to just timestamp if device info fails
      const now = new Date();
      const timestamp = now.toISOString()
        .replace(/T/, '_')
        .replace(/:/g, '-')
        .substring(0, 19);
      const fallbackFilename = `PPG_${timestamp}`;
      console.log('Using fallback filename:', fallbackFilename);
      return fallbackFilename;
    }
  };

  // Set default filename when modal becomes visible
  useEffect(() => {
    if (visible && !filename) {
      generateDefaultFilename().then(defaultName => {
        setFilename(defaultName);
      });
    }
  }, [visible]);

  const handleUpload = () => {
    const trimmedFilename = filename.trim();
    
    if (!trimmedFilename) {
      Alert.alert('Invalid Filename', 'Please enter a valid filename.');
      return;
    }

    // Sanitize filename - remove invalid characters
    const sanitizedFilename = trimmedFilename.replace(/[^a-zA-Z0-9_\-\s]/g, '');
    
    if (!sanitizedFilename) {
      Alert.alert('Invalid Filename', 'Filename contains invalid characters. Please use only letters, numbers, spaces, hyphens, and underscores.');
      return;
    }

    // Check filename length
    if (sanitizedFilename.length > 50) {
      Alert.alert('Filename Too Long', 'Please use a filename with 50 characters or less.');
      return;
    }

    // Check for reserved names
    const reservedNames = ['con', 'prn', 'aux', 'nul', 'com1', 'com2', 'lpt1', 'lpt2'];
    if (reservedNames.includes(sanitizedFilename.toLowerCase())) {
      Alert.alert('Reserved Filename', 'This filename is reserved. Please choose a different name.');
      return;
    }

    onShare(sanitizedFilename);
    setFilename(''); // Reset for next use
  };

  const handleCancel = () => {
    setFilename(''); // Reset for next use
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              Enter a filename to upload your PPG signal data to iCloud Drive
            </Text>
            
            <TextInput
              style={styles.textInput}
              value={filename}
              onChangeText={setFilename}
              placeholder={placeholder}
              placeholderTextColor="#999"
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={handleUpload}
              maxLength={50}
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.shareButton} onPress={handleUpload}>
                <Text style={styles.shareButtonText}>Upload to iCloud</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    backgroundColor: '#F9F9F9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default FilenamePrompt;
