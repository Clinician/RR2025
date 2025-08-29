# Native Blood Pressure Module Setup Guide

This guide explains how to configure the native Swift BloodPressureModule for Apple Health integration.

## Files Created

1. **Swift Module**: `ios/riva/BloodPressureModule.swift`
2. **Bridge Header**: `ios/riva/BloodPressureModule.m` 
3. **Bridging Header**: `ios/riva/riva-Bridging-Header.h`
4. **TypeScript Types**: `src/types/BloodPressureModule.d.ts`

## Xcode Project Configuration

### 1. Add Swift Files to Xcode Project

1. Open `ios/riva.xcworkspace` in Xcode
2. Right-click on the `riva` folder in the project navigator
3. Select "Add Files to 'riva'"
4. Add these files:
   - `BloodPressureModule.swift`
   - `BloodPressureModule.m`
   - `riva-Bridging-Header.h`

### 2. Configure Swift Bridging Header

1. In Xcode, select the `riva` project in the navigator
2. Select the `riva` target
3. Go to "Build Settings" tab
4. Search for "Objective-C Bridging Header"
5. Set the value to: `riva/riva-Bridging-Header.h`

### 3. Add HealthKit Framework

1. In Xcode, select the `riva` project
2. Select the `riva` target
3. Go to "General" tab
4. Scroll to "Frameworks, Libraries, and Embedded Content"
5. Click the "+" button
6. Search for and add `HealthKit.framework`

### 4. Enable HealthKit Capability

1. In Xcode, select the `riva` project
2. Select the `riva` target
3. Go to "Signing & Capabilities" tab
4. Click "+ Capability"
5. Add "HealthKit" capability

## Usage

The native module provides these methods:

```typescript
// Request permissions
await BloodPressureModule.requestPermissions();

// Save blood pressure
await BloodPressureModule.saveBloodPressure(130, 90, new Date().toISOString());

// Save heart rate
await BloodPressureModule.saveHeartRate(75, new Date().toISOString());

// Save vital signs (combined)
await BloodPressureModule.saveVitalSigns(75, 130, 90, new Date().toISOString());
```

## Info.plist Configuration

The following permissions are already configured in `Info.plist`:

```xml
<key>NSHealthShareUsageDescription</key>
<string>This app needs access to read your health data to track blood pressure measurements.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>This app needs access to write health data to store your blood pressure measurements.</string>
```

## Testing

After configuration, build and run the app on a physical iOS device (HealthKit doesn't work in simulator). The Save button in the ResultsScreen will:

1. Request HealthKit permissions if needed
2. Save heart rate (75 BPM) and blood pressure (130/90 mmHg) to Apple Health
3. Show success/error messages

## Troubleshooting

- **Module not found**: Ensure Swift files are added to Xcode project
- **Bridging header errors**: Check bridging header path in Build Settings
- **HealthKit unavailable**: Test on physical device, not simulator
- **Permission denied**: Check Info.plist permissions and capability settings
