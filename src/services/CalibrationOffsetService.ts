/**
 * CalibrationOffsetService
 * Service for managing calibration offsets with persistent storage and timestamp validation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CalibrationOffset {
  systolicOffset: number;
  diastolicOffset: number;
  timestamp: Date;
  calibrationType?: 'expert' | 'home';
}

export interface StoredCalibrationOffset {
  systolicOffset: number;
  diastolicOffset: number;
  timestamp: string; // ISO string for storage
  calibrationType?: 'expert' | 'home';
}

class CalibrationOffsetService {
  private static readonly STORAGE_KEY = '@riva_calibration_offset';
  private static readonly OFFSET_VALIDITY_MINUTES = 15;

  /**
   * Save calibration offsets to persistent storage
   */
  static async saveOffsets(
    systolicOffset: number, 
    diastolicOffset: number, 
    calibrationType: 'expert' | 'home' = 'home'
  ): Promise<void> {
    try {
      const offset: StoredCalibrationOffset = {
        systolicOffset,
        diastolicOffset,
        timestamp: new Date().toISOString(),
        calibrationType,
      };

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(offset));
      console.log('Calibration offsets saved:', offset);
    } catch (error) {
      console.error('Error saving calibration offsets:', error);
      throw error;
    }
  }

  /**
   * Load calibration offsets from persistent storage
   */
  static async loadOffsets(): Promise<CalibrationOffset | null> {
    try {
      const storedData = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (!storedData) {
        console.log('No calibration offsets found in storage');
        return null;
      }

      const parsed: StoredCalibrationOffset = JSON.parse(storedData);
      
      const offset: CalibrationOffset = {
        systolicOffset: parsed.systolicOffset,
        diastolicOffset: parsed.diastolicOffset,
        timestamp: new Date(parsed.timestamp),
        calibrationType: parsed.calibrationType || 'home', // Default to 'home' for backward compatibility
      };

      console.log('Calibration offsets loaded:', offset);
      return offset;
    } catch (error) {
      console.error('Error loading calibration offsets:', error);
      return null;
    }
  }

  /**
   * Check if stored offsets are valid (not older than 15 minutes)
   */
  static async areOffsetsValid(): Promise<boolean> {
    try {
      const offsets = await this.loadOffsets();
      
      if (!offsets) {
        console.log('No offsets available - invalid');
        return false;
      }

      const now = new Date();
      const offsetAge = now.getTime() - offsets.timestamp.getTime();
      const offsetAgeMinutes = offsetAge / (1000 * 60);
      
      const isValid = offsetAgeMinutes <= this.OFFSET_VALIDITY_MINUTES;
      
      console.log(`Offset age: ${offsetAgeMinutes.toFixed(1)} minutes, valid: ${isValid}`);
      return isValid;
    } catch (error) {
      console.error('Error checking offset validity:', error);
      return false;
    }
  }

  /**
   * Get the age of stored offsets in minutes
   */
  static async getOffsetAge(): Promise<number | null> {
    try {
      const offsets = await this.loadOffsets();
      
      if (!offsets) {
        return null;
      }

      const now = new Date();
      const offsetAge = now.getTime() - offsets.timestamp.getTime();
      return offsetAge / (1000 * 60);
    } catch (error) {
      console.error('Error getting offset age:', error);
      return null;
    }
  }

  /**
   * Clear stored calibration offsets
   */
  static async clearOffsets(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('Calibration offsets cleared');
    } catch (error) {
      console.error('Error clearing calibration offsets:', error);
      throw error;
    }
  }

  /**
   * Apply offsets to measurement results
   */
  static applyOffsets(
    systolic: number,
    diastolic: number,
    offsets: CalibrationOffset
  ): { systolic: number; diastolic: number } {
    return {
      systolic: systolic + offsets.systolicOffset,
      diastolic: diastolic + offsets.diastolicOffset,
    };
  }

  /**
   * Get calibration info including type and timestamp
   */
  static async getCalibrationInfo(): Promise<{
    isValid: boolean;
    timestamp: Date | null;
    calibrationType: 'expert' | 'home' | null;
    ageMinutes: number | null;
  }> {
    try {
      const offsets = await this.loadOffsets();
      
      if (!offsets) {
        return {
          isValid: false,
          timestamp: null,
          calibrationType: null,
          ageMinutes: null,
        };
      }

      const ageMinutes = await this.getOffsetAge();
      const isValid = ageMinutes !== null && ageMinutes <= this.OFFSET_VALIDITY_MINUTES;

      return {
        isValid,
        timestamp: offsets.timestamp,
        calibrationType: offsets.calibrationType || 'home',
        ageMinutes,
      };
    } catch (error) {
      console.error('Error getting calibration info:', error);
      return {
        isValid: false,
        timestamp: null,
        calibrationType: null,
        ageMinutes: null,
      };
    }
  }

  /**
   * Get a human-readable message about offset status
   */
  static async getOffsetStatusMessage(): Promise<string> {
    try {
      const offsets = await this.loadOffsets();
      
      if (!offsets) {
        return 'No calibration data available. Please calibrate your device first.';
      }

      const ageMinutes = await this.getOffsetAge();
      
      if (ageMinutes === null) {
        return 'Unable to determine calibration status.';
      }

      if (ageMinutes > this.OFFSET_VALIDITY_MINUTES) {
        return `Your calibration is ${Math.round(ageMinutes)} minutes old and has expired. Please recalibrate for accurate measurements.`;
      }

      return `Calibration is valid (${Math.round(ageMinutes)} minutes old).`;
    } catch (error) {
      console.error('Error getting offset status message:', error);
      return 'Unable to determine calibration status.';
    }
  }
}

export default CalibrationOffsetService;
