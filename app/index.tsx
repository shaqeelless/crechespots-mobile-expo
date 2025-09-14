// app/index.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/hooks/useAuth';

// Keep the splash screen visible until we're ready to navigate
SplashScreen.preventAutoHideAsync();

export default function IndexScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      const navigate = async () => {
        // Wait a brief moment to ensure the layout is mounted
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (user) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/onboarding');
        }
        
        // Hide the splash screen
        await SplashScreen.hideAsync();
        setIsReady(true);
      };

      navigate();
    }
  }, [user, loading]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}