/**
 * TypeScript declarations for BloodPressureModule native module
 */

export interface BloodPressureModule {
  /**
   * Request HealthKit permissions for blood pressure and heart rate
   */
  requestPermissions(): Promise<{ success: boolean }>;

  /**
   * Save blood pressure measurement to HealthKit
   */
  saveBloodPressure(
    systolic: number,
    diastolic: number,
    date: string
  ): Promise<{
    success: boolean;
    systolic: number;
    diastolic: number;
    date: string;
  }>;

  /**
   * Save heart rate measurement to HealthKit
   */
  saveHeartRate(
    heartRate: number,
    date: string
  ): Promise<{
    success: boolean;
    heartRate: number;
    date: string;
  }>;

  /**
   * Save vital signs (heart rate + blood pressure) to HealthKit
   */
  saveVitalSigns(
    heartRate: number,
    systolic: number,
    diastolic: number,
    date: string
  ): Promise<{
    success: boolean;
    heartRate: number;
    systolic: number;
    diastolic: number;
    date: string;
  }>;
}

declare module 'react-native' {
  interface NativeModulesStatic {
    BloodPressureModule: BloodPressureModule;
  }
}
