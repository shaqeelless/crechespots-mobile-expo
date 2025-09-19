import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function LayoutContent() {
  useFrameworkReady();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Index screen that handles initial redirect */}
      <Stack.Screen name="index" />
      
      {/* Authenticated routes */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="search/[id]" />
      <Stack.Screen name="apply/[id]" />
      <Stack.Screen name="children/index" />
      <Stack.Screen name="children/[id]" />
      <Stack.Screen name="children/add" />
      <Stack.Screen name="children/invite" />
      <Stack.Screen name="applications/index" />
      <Stack.Screen name="applications/history" />
      <Stack.Screen name="profile/edit" />
      
      {/* Auth screens */}
      <Stack.Screen name="(auth)/onboarding" />
      <Stack.Screen name="(auth)/welcome" />
      <Stack.Screen name="(auth)/register" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/provider-register" />
      
      {/* Fallback for 404 */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LayoutContent />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}