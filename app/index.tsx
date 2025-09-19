// app/index.tsx

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a spinner / loading screen while checking auth status
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If no user, send to auth onboarding or login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // If user is logged in, send to main app / tabs
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
