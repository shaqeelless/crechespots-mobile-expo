import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowRight } from 'lucide-react-native';

export default function ConfirmEmailScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('@/assets/images/SplashScreen.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Mail size={80} color="#3a5dc4" />
        </View>
        
        <Text style={styles.title}>Confirm Your Email</Text>
        
        <Text style={styles.subtitle}>
          Thank you for joining the crechespots community!
        </Text>

        <Text style={styles.description}>
          We've sent a confirmation email to your inbox. Please check your email and click the verification link to activate your account.
        </Text>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Didn't receive the email?</Text>
          <Text style={styles.tip}>• Check your spam or junk folder</Text>
          <Text style={styles.tip}>• Make sure you entered the correct email address</Text>
          <Text style={styles.tip}>• Wait a few minutes and try again</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable 
          style={styles.loginButton}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
          <ArrowRight size={20} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fcfe',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 200,
    height: 60,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(58, 93, 196, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3a5dc4',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3a5dc4',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#3a5dc4',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
    marginBottom: 32,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 93, 196, 0.2)',
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3a5dc4',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: '#3a5dc4',
    marginBottom: 8,
    opacity: 0.8,
  },
  footer: {
    paddingBottom: 50,
  },
  loginButton: {
    backgroundColor: '#3a5dc4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});