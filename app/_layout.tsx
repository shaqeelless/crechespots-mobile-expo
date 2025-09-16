import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/onboarding" />
        <Stack.Screen name="(auth)/welcome" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/provider-register" />
        <Stack.Screen name="search/[id]" />
        <Stack.Screen name="apply/[id]" />
        <Stack.Screen name="children/index" />
        <Stack.Screen name="children/[id]" />
        <Stack.Screen name="children/add" />
        <Stack.Screen name="children/invite" />
        <Stack.Screen name="applications/index" />
        <Stack.Screen name="applications/history" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}