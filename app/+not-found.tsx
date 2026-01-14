import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Home, Search } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Page Not Found',
        headerStyle: {
          backgroundColor: '#f4fcfe',
        },
        headerTintColor: '#3a5dc4',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }} />
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/SplashScreen.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Illustration/Icon */}
        <View style={styles.iconContainer}>
          <Search size={80} color="#bd84f6" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Page Not Found</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Link href="/" style={styles.primaryButton}>

            <Text style={styles.primaryButtonText}>Go to Home</Text>
          </Link>
          
          <Link href="/search" style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Find Creches</Text>
          </Link>
        </View>

        {/* Help Text */}
        <Text style={styles.helpText}>
          If you believe this is an error, please contact support
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f4fcfe',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 60,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(189, 132, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(189, 132, 246, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3a5dc4',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    maxWidth: 300,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#bd84f6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    minWidth: 160,
    shadowColor: '#bd84f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3a5dc4',
    gap: 8,
    minWidth: 160,
  },
  secondaryButtonText: {
    color: '#3a5dc4',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 20,
  },
});