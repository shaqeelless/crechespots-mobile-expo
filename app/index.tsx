import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { user, loading, error } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (error && retryCount < 2) {
      // Retry once before redirecting
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (error && retryCount >= 2) {
      // After 2 retries, redirect to onboarding
      const redirectTimer = setTimeout(() => {
        setShouldRedirect(true);
      }, 500);
      return () => clearTimeout(redirectTimer);
    }
  }, [error, retryCount]);

  // Redirect to onboarding after retries failed
  if (shouldRedirect) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Image 
          source={require('@/assets/images/SplashScreen.png')}
          style={styles.logo}
        />
      </View>
    );
  }

  // If there's an error and we've exhausted retries, or immediate error
  if (error && retryCount >= 2) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href={user ? "/(tabs)" : "/(auth)/onboarding"} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4fcfe',
  },
  logo: {
    width: 200, // Adjust as needed
    height: 200, // Adjust as needed
    resizeMode: 'contain'
  },
});