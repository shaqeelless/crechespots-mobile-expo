// app/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible until we're ready to navigate
SplashScreen.preventAutoHideAsync();

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const navigateToOnboarding = async () => {
      // Wait a brief moment to ensure the layout is mounted
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to onboarding
      router.replace('/(auth)/onboarding');
      
      // Hide the splash screen
      await SplashScreen.hideAsync();
    };

    navigateToOnboarding();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}