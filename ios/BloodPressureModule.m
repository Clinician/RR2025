/**
 * BloodPressureModule.m
 * React Native bridge for the Swift BloodPressureModule
 */

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BloodPressureModule, NSObject)

// Request HealthKit permissions
RCT_EXTERN_METHOD(requestPermissions:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Save blood pressure to HealthKit
RCT_EXTERN_METHOD(saveBloodPressure:(NSNumber *)systolic
                  diastolic:(NSNumber *)diastolic
                  date:(NSString *)date
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Save heart rate to HealthKit
RCT_EXTERN_METHOD(saveHeartRate:(NSNumber *)heartRate
                  date:(NSString *)date
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Save vital signs (heart rate + blood pressure) to HealthKit
RCT_EXTERN_METHOD(saveVitalSigns:(NSNumber *)heartRate
                  systolic:(NSNumber *)systolic
                  diastolic:(NSNumber *)diastolic
                  date:(NSString *)date
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
