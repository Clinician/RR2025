/**
 * FilenamePrompt Component
 * Modal component for prompting user to enter a filename for saving PPG data
 *
 * @format
 */

import React, { useState } from 'react';
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

interface FilenamePromptProps {
  visible: boolean;
  onShare: (filename: string) => void;
  onSaveOnly: (filename: string) => void;
  onCancel: () => void;
  title?: string;
  placeholder?: string;
}

const FilenamePrompt: React.FC<FilenamePromptProps> = ({
  visible,
  onShare,
  onSaveOnly,
  onCancel,
  title = 'Share PPG Data',
  placeholder = 'Enter filename...',
}) => {
  const [filename, setFilename] = useState('');

  const handleAction = (action: 'share' | 'save') => {
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

    if (action === 'share') {
      onShare(sanitizedFilename);
    } else {
      onSaveOnly(sanitizedFilename);
    }
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
              Enter a filename and choose how to share your PPG signal data
            </Text>
            
            <TextInput
              style={styles.textInput}
              value={filename}
              onChangeText={setFilename}
              placeholder={placeholder}
              placeholderTextColor="#999"
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={() => handleAction('share')}
              maxLength={50}
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveOnlyButton} onPress={() => handleAction('save')}>
                <Text style={styles.saveOnlyButtonText}>Save Only</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.shareButton} onPress={() => handleAction('share')}>
                <Text style={styles.shareButtonText}>Share</Text>
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
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  saveOnlyButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  saveOnlyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    textAlign: 'center',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default FilenamePrompt;
