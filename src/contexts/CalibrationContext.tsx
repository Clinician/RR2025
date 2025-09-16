/**
 * CalibrationContext
 * Context for managing calibration workflow state and reference measurements
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import CalibrationOffsetService, { CalibrationOffset } from '../services/CalibrationOffsetService';

export type MeasurementType = 'expert' | 'home';

export interface ReferenceMeasurement {
  systolic: number;
  diastolic: number;
  timestamp: Date;
  measurementType: MeasurementType;
}

// Remove local CalibrationOffset interface - using the one from CalibrationOffsetService

interface CalibrationContextType {
  isCalibrationMode: boolean;
  referenceMeasurement: ReferenceMeasurement | null;
  calibrationOffset: CalibrationOffset | null;
  storedOffsets: CalibrationOffset | null;
  areStoredOffsetsValid: boolean;
  setCalibrationMode: (mode: boolean) => void;
  setReferenceMeasurement: (measurement: ReferenceMeasurement) => void;
  setCalibrationOffset: (offset: CalibrationOffset) => void;
  saveCalibrationOffsets: (systolicOffset: number, diastolicOffset: number) => Promise<void>;
  loadStoredOffsets: () => Promise<void>;
  checkOffsetValidity: () => Promise<boolean>;
  resetCalibration: () => void;
}

const CalibrationContext = createContext<CalibrationContextType | undefined>(undefined);

export const useCalibration = () => {
  const context = useContext(CalibrationContext);
  if (context === undefined) {
    throw new Error('useCalibration must be used within a CalibrationProvider');
  }
  return context;
};

interface CalibrationProviderProps {
  children: ReactNode;
}

export const CalibrationProvider: React.FC<CalibrationProviderProps> = ({ children }) => {
  const [isCalibrationMode, setIsCalibrationMode] = useState(false);
  const [referenceMeasurement, setReferenceMeasurement] = useState<ReferenceMeasurement | null>(null);
  const [calibrationOffset, setCalibrationOffset] = useState<CalibrationOffset | null>(null);
  const [storedOffsets, setStoredOffsets] = useState<CalibrationOffset | null>(null);
  const [areStoredOffsetsValid, setAreStoredOffsetsValid] = useState(false);

  // Load stored offsets on component mount
  useEffect(() => {
    loadStoredOffsets();
  }, []);

  const setCalibrationMode = (mode: boolean) => {
    setIsCalibrationMode(mode);
    if (!mode) {
      // Reset calibration data when exiting calibration mode
      setReferenceMeasurement(null);
      setCalibrationOffset(null);
    }
  };

  const saveCalibrationOffsets = async (systolicOffset: number, diastolicOffset: number): Promise<void> => {
    try {
      await CalibrationOffsetService.saveOffsets(systolicOffset, diastolicOffset);
      // Reload stored offsets after saving
      await loadStoredOffsets();
    } catch (error) {
      console.error('Error saving calibration offsets:', error);
      throw error;
    }
  };

  const loadStoredOffsets = async (): Promise<void> => {
    try {
      const offsets = await CalibrationOffsetService.loadOffsets();
      setStoredOffsets(offsets);
      
      if (offsets) {
        const isValid = await CalibrationOffsetService.areOffsetsValid();
        setAreStoredOffsetsValid(isValid);
      } else {
        setAreStoredOffsetsValid(false);
      }
    } catch (error) {
      console.error('Error loading stored offsets:', error);
      setStoredOffsets(null);
      setAreStoredOffsetsValid(false);
    }
  };

  const checkOffsetValidity = async (): Promise<boolean> => {
    try {
      const isValid = await CalibrationOffsetService.areOffsetsValid();
      setAreStoredOffsetsValid(isValid);
      return isValid;
    } catch (error) {
      console.error('Error checking offset validity:', error);
      setAreStoredOffsetsValid(false);
      return false;
    }
  };

  const resetCalibration = () => {
    setIsCalibrationMode(false);
    setReferenceMeasurement(null);
    setCalibrationOffset(null);
  };

  const value: CalibrationContextType = {
    isCalibrationMode,
    referenceMeasurement,
    calibrationOffset,
    storedOffsets,
    areStoredOffsetsValid,
    setCalibrationMode,
    setReferenceMeasurement,
    setCalibrationOffset,
    saveCalibrationOffsets,
    loadStoredOffsets,
    checkOffsetValidity,
    resetCalibration,
  };

  return (
    <CalibrationContext.Provider value={value}>
      {children}
    </CalibrationContext.Provider>
  );
};
