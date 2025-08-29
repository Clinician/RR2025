/**
 * HealthService
 * Service to handle Apple Health integration using native BloodPressureModule
 *
 * @format
 */

import { Platform, NativeModules } from 'react-native';

const { BloodPressureModule } = NativeModules;


class HealthService {
  private isInitialized = false;

  /**
   * Request HealthKit permissions using native module
   */
  async requestPermissions(onLoadingChange?: (loading: boolean) => void): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('HealthKit is only available on iOS');
      return false;
    }

    if (!BloodPressureModule) {
      console.log('BloodPressureModule is not available');
      return false;
    }

    onLoadingChange?.(true);

    try {
      await BloodPressureModule.requestPermissions();
      onLoadingChange?.(false);
      this.isInitialized = true;
      console.log('HealthKit permissions granted successfully');
      return true;
    } catch (error) {
      onLoadingChange?.(false);
      console.log('HealthKit permission request failed:', error);
      return false;
    }
  }


  /**
   * Check if HealthKit is available and initialized
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' && this.isInitialized;
  }

  /**
   * Save blood pressure measurement to HealthKit using native module
   */
  async saveBloodPressure(now: string, systolic: number, diastolic: number): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log('HealthKit not available');
      return false;
    }

    try {
      const result = await BloodPressureModule.saveBloodPressure(systolic, diastolic, now);
      console.log('Successfully saved blood pressure:', result);
      return true;
    } catch (error) {
      console.log('Failed to save blood pressure:', error);
      return false;
    }
  }

  /**
   * Save heart rate measurement to HealthKit using native module
   */
  async saveHeartRate(now: string, heartRate: number): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log('HealthKit not available');
      return false;
    }

    try {
      const result = await BloodPressureModule.saveHeartRate(heartRate, now);
      console.log('Successfully saved heart rate:', result);
      return true;
    } catch (error) {
      console.log('Failed to save heart rate:', error);
      return false;
    }
  }

  /**
   * Save both heart rate and blood pressure to HealthKit using native module
   */
  async saveVitalSigns(heartRate: number, systolic: number, diastolic: number): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log('HealthKit not available');
      return false;
    }

    try {
      const now = new Date().toISOString();
      console.log('Saving vital signs to HealthKit:', heartRate, systolic, diastolic, now);
      const result = await BloodPressureModule.saveVitalSigns(heartRate, systolic, diastolic, now);
      console.log('Successfully saved vital signs:', result);
      return true;
    } catch (error) {
      console.log('Error saving vital signs to HealthKit:', error);
      return false;
    }
  }

  /**
   * Get latest blood pressure readings from HealthKit
   * Note: This would require additional native implementation for reading data
   */
  async getLatestBloodPressure(): Promise<any> {
    if (!this.isAvailable()) {
      console.log('HealthKit not available');
      return null;
    }

    // TODO: Implement reading functionality in native module if needed
    console.log('Reading blood pressure data not implemented in native module yet');
    return null;
  }
}

export default new HealthService();
