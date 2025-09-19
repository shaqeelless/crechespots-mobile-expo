import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function LayoutContent() {
  useFrameworkReady();
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Optionally, show a loading screen or splash
  }

  const isAuthenticated = !!user;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          {/* Tabs and authenticated routes */}
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
        </>
      ) : (
        <>
          {/* Auth screens for unauthenticated users */}
          <Stack.Screen name="(auth)/onboarding" />
          <Stack.Screen name="(auth)/welcome" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/provider-register" />
        </>
      )}
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
