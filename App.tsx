/**
 * oBPM React Native App
 * Main App Entry Point with Splash Screen
 *
 * @format
 */

import { useEffect, useState } from "react";
import BootSplash from "react-native-bootsplash";
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from "./src/screens/Home/Home";
import OnboardingScreen from "./src/screens/onboarding/Onboarding";
import TermsAndConditions from "./src/screens/onboarding/TermsAndConditions";
import { CalibrationProvider } from "./src/contexts/CalibrationContext";

const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';
const TERMS_ACCEPTED_KEY = '@terms_accepted';

const App = () => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Check if onboarding has been completed
        const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        setIsOnboardingCompleted(onboardingCompleted === 'true');
        
        // Check if terms have been accepted
        const termsAccepted = await AsyncStorage.getItem(TERMS_ACCEPTED_KEY);
        setIsTermsAccepted(termsAccepted === 'true');
      } catch (error) {
        console.error('Error checking onboarding/terms status:', error);
        // Default to showing onboarding if there's an error
        setIsOnboardingCompleted(false);
        setIsTermsAccepted(false);
      }
    };

    init().finally(async () => {
      await BootSplash.hide({ fade: true });
      console.log("BootSplash has been hidden successfully");
    });
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      setIsOnboardingCompleted(true);
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
    }
  };

  const handleTermsAccept = async () => {
    try {
      await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
      setIsTermsAccepted(true);
    } catch (error) {
      console.error('Error saving terms acceptance:', error);
    }
  };

  // Show loading state while checking onboarding and terms status
  if (isOnboardingCompleted === null || isTermsAccepted === null) {
    return null; // or a loading spinner
  }

  // Show onboarding for first-time users
  if (!isOnboardingCompleted) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Show terms and conditions after onboarding
  if (!isTermsAccepted) {
    return <TermsAndConditions onAccept={handleTermsAccept} />;
  }

  // Show main screen for returning users
  return (
    <CalibrationProvider>
      <HomeScreen />
    </CalibrationProvider>
  );
};

export default App;
