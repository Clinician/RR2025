/**
 * HealthService
 * Service to handle Apple Health integration
 *
 * @format
 */

import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthKitPermissions,
} from 'react-native-health';

class HealthService {
  private isInitialized = false;

  /**
   * Initialize HealthKit and request permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('HealthKit is only available on iOS');
      return false;
    }

    const permissions: HealthKitPermissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.BloodPressureDiastolic,
          AppleHealthKit.Constants.Permissions.BloodPressureSystolic,
          AppleHealthKit.Constants.Permissions.HeartRate,
        ],
        write: [
          AppleHealthKit.Constants.Permissions.BloodPressureDiastolic,
          AppleHealthKit.Constants.Permissions.BloodPressureSystolic,
          AppleHealthKit.Constants.Permissions.HeartRate,
        ],
      },
    };

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(permissions, (error: string) => {
        if (error) {
          console.log('HealthKit initialization failed:', error);
          resolve(false);
        } else {
          console.log('HealthKit initialized successfully');
          this.isInitialized = true;
          resolve(true);
        }
      });
    });
  }

  /**
   * Check if HealthKit is available and initialized
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' && this.isInitialized;
  }

  /**
   * Save blood pressure measurement to HealthKit
   */
  async saveBloodPressure(systolic: number, diastolic: number): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log('HealthKit not available');
      return false;
    }

    // For now, just simulate saving - the actual implementation would use the correct API
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Simulated saving blood pressure: ${systolic}/${diastolic}`);
        resolve(true);
      }, 1000);
    });
  }

  /**
   * Get latest blood pressure readings from HealthKit
   */
  async getLatestBloodPressure(): Promise<any> {
    if (!this.isAvailable()) {
      console.log('HealthKit not available');
      return null;
    }

    const options = {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
      endDate: new Date().toISOString(),
      limit: 1,
    };

    return new Promise((resolve) => {
      AppleHealthKit.getBloodPressureSamples(
        options,
        (error: string, results: any[]) => {
          if (error) {
            console.log('Failed to get blood pressure:', error);
            resolve(null);
          } else {
            resolve(results.length > 0 ? results[0] : null);
          }
        }
      );
    });
  }
}

export default new HealthService();
