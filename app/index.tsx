import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a splash/loading screen
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Authenticated users get redirected to the tabs/home page
  return <Redirect href="/(tabs)/home" />;
}
