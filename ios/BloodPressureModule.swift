/**
 * BloodPressureModule
 * Native Swift module for Apple Health blood pressure integration
 */

import Foundation
import HealthKit
import React

@objc(BloodPressureModule)
class BloodPressureModule: NSObject {
  
  private let healthStore = HKHealthStore()
  
  // MARK: - React Native Bridge
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  // MARK: - Permission Management
  
  @objc
  func requestPermissions(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    guard HKHealthStore.isHealthDataAvailable() else {
      reject("HEALTH_UNAVAILABLE", "Health data is not available on this device", nil)
      return
    }
    
    let typesToWrite: Set<HKSampleType> = [
      HKQuantityType.quantityType(forIdentifier: .bloodPressureSystolic)!,
      HKQuantityType.quantityType(forIdentifier: .bloodPressureDiastolic)!,
      HKQuantityType.quantityType(forIdentifier: .heartRate)!
    ]
    
    let typesToRead: Set<HKObjectType> = [
      HKQuantityType.quantityType(forIdentifier: .bloodPressureSystolic)!,
      HKQuantityType.quantityType(forIdentifier: .bloodPressureDiastolic)!,
      HKQuantityType.quantityType(forIdentifier: .heartRate)!
    ]
    
    healthStore.requestAuthorization(toShare: typesToWrite, read: typesToRead) { [weak self] (success, error) in
      DispatchQueue.main.async {
        if let error = error {
          reject("PERMISSION_ERROR", "Failed to request health permissions: \(error.localizedDescription)", error)
        } else if success {
          resolve(["success": true])
        } else {
          reject("PERMISSION_DENIED", "Health permissions were denied", nil)
        }
      }
    }
  }
  
  // MARK: - Blood Pressure Saving
  
  @objc
  func saveBloodPressure(_ systolic: NSNumber, diastolic: NSNumber, date: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    guard HKHealthStore.isHealthDataAvailable() else {
      reject("HEALTH_UNAVAILABLE", "Health data is not available on this device", nil)
      return
    }
    
    // Parse the date string
    let dateFormatter = ISO8601DateFormatter()
    dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
    dateFormatter.formatOptions = [
        .withFullDate,
        .withFullTime,
        .withDashSeparatorInDate,
        .withFractionalSeconds]
    guard let measurementDate = dateFormatter.date(from: date) else {
      reject("INVALID_DATE", "Invalid date format provided: \(date)", nil)
      return
    }
    
    // Create quantity types
    guard let systolicType = HKQuantityType.quantityType(forIdentifier: .bloodPressureSystolic),
          let diastolicType = HKQuantityType.quantityType(forIdentifier: .bloodPressureDiastolic) else {
      reject("INVALID_TYPE", "Failed to create blood pressure quantity types", nil)
      return
    }
    
    // Create quantities
    let systolicQuantity = HKQuantity(unit: HKUnit.millimeterOfMercury(), doubleValue: systolic.doubleValue)
    let diastolicQuantity = HKQuantity(unit: HKUnit.millimeterOfMercury(), doubleValue: diastolic.doubleValue)
    
    // Create samples
    let systolicSample = HKQuantitySample(type: systolicType, quantity: systolicQuantity, start: measurementDate, end: measurementDate)
    let diastolicSample = HKQuantitySample(type: diastolicType, quantity: diastolicQuantity, start: measurementDate, end: measurementDate)
    
    // Save to HealthKit
    healthStore.save([systolicSample, diastolicSample]) { [weak self] (success, error) in
      DispatchQueue.main.async {
        if let error = error {
          reject("SAVE_ERROR", "Failed to save blood pressure: \(error.localizedDescription)", error)
        } else if success {
          resolve([
            "success": true,
            "systolic": systolic,
            "diastolic": diastolic,
            "date": date
          ])
        } else {
          reject("SAVE_FAILED", "Failed to save blood pressure to Health app", nil)
        }
      }
    }
  }
  
  // MARK: - Heart Rate Saving
  
  @objc
  func saveHeartRate(_ heartRate: NSNumber, date: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    guard HKHealthStore.isHealthDataAvailable() else {
      reject("HEALTH_UNAVAILABLE", "Health data is not available on this device", nil)
      return
    }
    
    // Parse the date string
    let dateFormatter = ISO8601DateFormatter()
    dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
    dateFormatter.formatOptions = [
        .withFullDate,
        .withFullTime,
        .withDashSeparatorInDate,
        .withFractionalSeconds]
    guard let measurementDate = dateFormatter.date(from: date) else {
      reject("INVALID_DATE", "Invalid date format provided", nil)
      return
    }
    
    // Create quantity type
    guard let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) else {
      reject("INVALID_TYPE", "Failed to create heart rate quantity type", nil)
      return
    }
    
    // Create quantity
    let heartRateQuantity = HKQuantity(unit: HKUnit.count().unitDivided(by: HKUnit.minute()), doubleValue: heartRate.doubleValue)
    
    // Create sample
    let heartRateSample = HKQuantitySample(type: heartRateType, quantity: heartRateQuantity, start: measurementDate, end: measurementDate)
    
    // Save to HealthKit
    healthStore.save(heartRateSample) { [weak self] (success, error) in
      DispatchQueue.main.async {
        if let error = error {
          reject("SAVE_ERROR", "Failed to save heart rate: \(error.localizedDescription)", error)
        } else if success {
          resolve([
            "success": true,
            "heartRate": heartRate,
            "date": date
          ])
        } else {
          reject("SAVE_FAILED", "Failed to save heart rate to Health app", nil)
        }
      }
    }
  }
  
  // MARK: - Combined Vital Signs Saving
  
  @objc
  func saveVitalSigns(_ heartRate: NSNumber, systolic: NSNumber, diastolic: NSNumber, date: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    guard HKHealthStore.isHealthDataAvailable() else {
      reject("HEALTH_UNAVAILABLE", "Health data is not available on this device", nil)
      return
    }

    // Parse the date string
    let dateFormatter = ISO8601DateFormatter()
    dateFormatter.timeZone = TimeZone(secondsFromGMT: 0)
    dateFormatter.formatOptions = [
        .withFullDate,
        .withFullTime,
        .withDashSeparatorInDate,
        .withFractionalSeconds]
    guard let measurementDate = dateFormatter.date(from: date) else {
      reject("INVALID_DATE", "Invalid date format provided", nil)
      return
    }
    
    // Create quantity types
    guard let systolicType = HKQuantityType.quantityType(forIdentifier: .bloodPressureSystolic),
          let diastolicType = HKQuantityType.quantityType(forIdentifier: .bloodPressureDiastolic),
          let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) else {
      reject("INVALID_TYPE", "Failed to create quantity types", nil)
      return
    }
    
    // Create quantities
    let systolicQuantity = HKQuantity(unit: HKUnit.millimeterOfMercury(), doubleValue: systolic.doubleValue)
    let diastolicQuantity = HKQuantity(unit: HKUnit.millimeterOfMercury(), doubleValue: diastolic.doubleValue)
    let heartRateQuantity = HKQuantity(unit: HKUnit.count().unitDivided(by: HKUnit.minute()), doubleValue: heartRate.doubleValue)
    
    // Create samples
    let systolicSample = HKQuantitySample(type: systolicType, quantity: systolicQuantity, start: measurementDate, end: measurementDate)
    let diastolicSample = HKQuantitySample(type: diastolicType, quantity: diastolicQuantity, start: measurementDate, end: measurementDate)
    let heartRateSample = HKQuantitySample(type: heartRateType, quantity: heartRateQuantity, start: measurementDate, end: measurementDate)
    
    // Save all samples together
    healthStore.save([systolicSample, diastolicSample, heartRateSample]) { [weak self] (success, error) in
      DispatchQueue.main.async {
        if let error = error {
          reject("SAVE_ERROR", "Failed to save vital signs: \(error.localizedDescription)", error)
        } else if success {
          resolve([
            "success": true,
            "heartRate": heartRate,
            "systolic": systolic,
            "diastolic": diastolic,
            "date": date
          ])
        } else {
          reject("SAVE_FAILED", "Failed to save vital signs to Health app", nil)
        }
      }
    }
  }
}
