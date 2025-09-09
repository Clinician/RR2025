# Original PPG Converter Implementation

This directory contains the original C# implementation of the Video2PPGConverter class that was used as the reference for creating the Swift version for React Native iOS integration.

## Files

- `Video2PPGConverter.cs` - Original C# implementation that converts video frames to PPG (photoplethysmography) signals

## Purpose

The C# implementation served as the source code for the Swift conversion located at `/ios/Video2PPGConverter.swift`. The Swift version maintains identical algorithm logic and functionality while being compatible with React Native iOS applications.

## Algorithm Overview

The converter processes video frames by:
1. Dividing images into regions of interest (ROIs)
2. Extracting luminance features from Y, U, V color channels
3. Computing mean values for each ROI
4. Performing quality assessment based on luminance variance and intensity thresholds
5. Returning PPG-like signals and quality warnings

## Migration Status

✅ **Converted to Swift** - The functionality has been ported to Swift with React Native bridge integration.