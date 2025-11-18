import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowRight } from 'lucide-react-native';

export default function ConfirmEmailScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            <Mail size={60} color="#3a5dc4" />
          </View>
          
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
  },
  scrollContent: {
    flexGrow: 1,
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
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(58, 93, 196, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3a5dc4',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#3a5dc4',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
    marginBottom: 32,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 93, 196, 0.2)',
    width: '100%',
  },
  tip: {
    fontSize: 14,
    color: '#3a5dc4',
    marginBottom: 8,
    opacity: 0.8,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(58, 93, 196, 0.1)',
  },
  loginButton: {
    backgroundColor: '#3a5dc4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});