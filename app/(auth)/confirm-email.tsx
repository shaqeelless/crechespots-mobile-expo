import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

// Preload images
const preloadedImages = {
  splashScreen: require('@/assets/images/SplashScreen.png'),
  emailConfirm: require('@/assets/images/emailconfirm.png'),
};

export default function ConfirmEmailScreen() {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const router = useRouter();

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imageUris = [
          Image.prefetch(Image.resolveAssetSource(preloadedImages.splashScreen).uri),
          Image.prefetch(Image.resolveAssetSource(preloadedImages.emailConfirm).uri),
        ];
        
        await Promise.all(imageUris);
        setImagesLoaded(true);
      } catch (error) {
        console.log('Image preloading error:', error);
        setImagesLoaded(true); // Continue anyway even if preloading fails
      }
    };

    preloadImages();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={preloadedImages.splashScreen}
            style={styles.logoImage}
            resizeMode="contain"
            fadeDuration={0}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>

            <Image 
              source={preloadedImages.emailConfirm}
              style={styles.emailIcon}
              resizeMode="contain"
              fadeDuration={0}
            />
            {/* Loading skeleton */}
            {!imagesLoaded && (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>Loading...</Text>
              </View>
            )}
          
          <Text style={styles.title}>Check Your Email</Text>
          
          <Text style={styles.description}>
            We've sent a confirmation email to your inbox. Please verify your email address to activate your account.
          </Text>

          <View style={styles.tipsContainer}>
            <Text style={styles.tip}>• Check your spam folder</Text>
            <Text style={styles.tip}>• Verify the email address is correct</Text>
            <Text style={styles.tip}>• Contact support if you need help</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable 
          style={styles.loginButton}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>Continue to Login</Text>
          <ArrowRight size={isSmallScreen ? 18 : 20} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fcfe',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: isSmallScreen ? 40 : 60,
    paddingHorizontal: isSmallScreen ? 20 : 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? 20 : 40,
  },
  logoImage: {
    width: isSmallScreen ? 160 : 200,
    height: isSmallScreen ? 45 : 60,
  },
  content: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: isSmallScreen ? 100 : 120,
    height: isSmallScreen ? 100 : 120,
    borderRadius: isSmallScreen ? 50 : 60,
    backgroundColor: 'rgba(58, 93, 196, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isSmallScreen ? 20 : 24,
    position: 'relative',
  },
  emailIcon: {
    width: width * 0.7,
    height: '100%',
    maxHeight: isSmallScreen ? 150 : 200,
  },
  imagePlaceholder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: isSmallScreen ? 50 : 60,
  },
  placeholderText: {
    color: '#666',
    fontSize: isSmallScreen ? 10 : 12,
  },
  title: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    color: '#3a5dc4',
    textAlign: 'center',
    marginBottom: isSmallScreen ? 12 : 16,
  },
  description: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#3a5dc4',
    textAlign: 'center',
    lineHeight: isSmallScreen ? 20 : 22,
    opacity: 0.9,
    marginBottom: isSmallScreen ? 24 : 32,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: isSmallScreen ? 12 : 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 93, 196, 0.2)',
    width: '100%',
  },
  tip: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#3a5dc4',
    marginBottom: isSmallScreen ? 6 : 8,
    opacity: 0.8,
  },
  footer: {
    padding: isSmallScreen ? 20 : 24,
    paddingBottom: isSmallScreen ? 30 : 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(58, 93, 196, 0.1)',
  },
  loginButton: {
    backgroundColor: '#3a5dc4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 14 : 16,
    paddingHorizontal: isSmallScreen ? 20 : 24,
    borderRadius: 12,
    gap: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
  },
});