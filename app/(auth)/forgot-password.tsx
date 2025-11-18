import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

// Preload images
const preloadedImages = {
  splashScreen: require('@/assets/images/SplashScreen.png'),
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState('');

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setFormErrors('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setFormErrors('Please enter a valid email address');
      return false;
    }
    setFormErrors('');
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) return;

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'crechespots://reset-password', // This should match your app scheme
      });

      if (error) {
        console.error('Error sending OTP:', error);
        
        if (error.message.includes('rate limit')) {
          Alert.alert('Too Many Requests', 'Please wait a few minutes before trying again.');
        } else {
          Alert.alert('Error', 'Failed to send OTP. Please check your email address and try again.');
        }
      } else {
        // Success - navigate to OTP screen with email
        router.push({
          pathname: '/(auth)/otp',
          params: { email }
        });
        
        Alert.alert('OTP Sent', 'Check your email for the password reset code.');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={preloadedImages.splashScreen}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a code to reset your password.
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={[styles.inputContainer, formErrors && styles.inputError]}>
              <Mail size={20} color="#3a5dc4" />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#666"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (formErrors) setFormErrors('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {formErrors ? <Text style={styles.errorText}>{formErrors}</Text> : null}

            <Text style={styles.helpText}>
              You'll receive a 6-digit code via email to reset your password.
            </Text>
          </View>

          {/* Send OTP Button */}
          <Pressable 
            style={[styles.otpButton, loading && styles.disabledButton]} 
            onPress={handleSendOTP}
            disabled={loading}
          >
            <Text style={styles.otpButtonText}>
              {loading ? 'Sending Code...' : 'Send Reset Code'}
            </Text>
            {!loading && <ArrowRight size={20} color="#ffffff" />}
          </Pressable>

          {/* Back to Login */}
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>
              Back to Login
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fcfe',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: isSmallScreen ? 50 : 70,
    paddingHorizontal: 32,
    paddingBottom: isSmallScreen ? 20 : 32,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: isSmallScreen ? 180 : 220,
    height: isSmallScreen ? 50 : 65,
  },
  content: {
    paddingHorizontal: isSmallScreen ? 24 : 32,
    paddingBottom: isSmallScreen ? 40 : 60,
  },
  title: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: 'bold',
    color: '#3a5dc4',
    textAlign: 'center',
    marginBottom: isSmallScreen ? 8 : 12,
  },
  subtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#3a5dc4',
    textAlign: 'center',
    marginBottom: isSmallScreen ? 24 : 32,
    opacity: 0.9,
    lineHeight: isSmallScreen ? 20 : 22,
  },
  form: {
    marginBottom: isSmallScreen ? 24 : 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: isSmallScreen ? 14 : 16,
    marginBottom: isSmallScreen ? 12 : 16,
    borderWidth: 1,
    borderColor: 'rgba(58, 93, 196, 0.3)',
  },
  inputError: {
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: isSmallScreen ? 14 : 16,
    color: '#333',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: isSmallScreen ? 12 : 13,
    marginTop: -8,
    marginBottom: isSmallScreen ? 12 : 16,
    marginLeft: 8,
  },
  helpText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#3a5dc4',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: isSmallScreen ? 18 : 20,
  },
  otpButton: {
    backgroundColor: '#3a5dc4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 14 : 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: isSmallScreen ? 20 : 24,
    gap: 8,
    shadowColor: '#3a5dc4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  otpButtonText: {
    color: '#ffffff',
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#3a5dc4',
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});