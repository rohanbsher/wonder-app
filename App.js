import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MorningRitual from './services/MorningRitual';
import { useCustomFonts } from './styles/typography';

// Components
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';

// Screens
import OnboardingScreen from './screens/OnboardingScreen';
import DailyScreen from './screens/DailyScreen';
import MajesticJourneyScreen from './screens/MajesticJourneyScreen';
import DepthScreen from './screens/DepthScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const fontsLoaded = useCustomFonts();

  useEffect(() => {
    if (fontsLoaded) {
      checkFirstTimeUser();
    }
  }, [fontsLoaded]);

  const checkFirstTimeUser = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      setIsFirstTime(!onboardingCompleted);

      if (onboardingCompleted) {
        // Initialize morning ritual for returning users
        await MorningRitual.initialize();
      }
    } catch (error) {
      console.error('Error checking first time user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Stack.Navigator
          initialRouteName={isFirstTime ? "Onboarding" : "Journey"}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#000000' },
            animationEnabled: true,
            gestureEnabled: true,
          }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Journey" component={MajesticJourneyScreen} />
          <Stack.Screen name="Depth" component={DepthScreen} />
          <Stack.Screen name="Daily" component={DailyScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}