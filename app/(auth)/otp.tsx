import React, { useState, useRef } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

// Preload images
const preloadedImages = {
  splashScreen: require('@/assets/images/SplashScreen.png'),
};

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.split('').slice(0, 6);
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      
      // Focus last input
      const lastIndex = Math.min(5, pastedOtp.length - 1);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // For Supabase, we need to use the verifyOtp method
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpString,
        type: 'recovery',
      });

      if (verifyError) {
        console.error('OTP verification error:', verifyError);
        
        if (verifyError.message.includes('invalid')) {
          setError('Invalid verification code. Please check the code and try again.');
        } else if (verifyError.message.includes('expired')) {
          setError('Verification code has expired. Please request a new one.');
        } else {
          setError('Failed to verify code. Please try again.');
        }
      } else {
        // Success - navigate to reset password screen
        router.push({
          pathname: '/(auth)/reset-password',
          params: { email, token: otpString }
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'crechespots://reset-password',
      });

      if (error) {
        Alert.alert('Error', 'Failed to resend code. Please try again.');
      } else {
        Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
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
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to {email}
          </Text>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={[styles.otpInput, error && styles.inputError]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={index === 0 ? 6 : 1} // Allow paste on first input
                selectTextOnFocus
              />
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.helpText}>
            Enter the 6-digit code from your email to continue.
          </Text>

          {/* Verify Button */}
          <Pressable 
            style={[styles.verifyButton, loading && styles.disabledButton]} 
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            <Text style={styles.verifyButtonText}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </Text>
            {!loading && <ArrowRight size={20} color="#ffffff" />}
          </Pressable>

          {/* Resend Code */}
          <Pressable 
            style={styles.resendButton}
            onPress={handleResendOTP}
            disabled={loading}
          >
            <Text style={styles.resendButtonText}>
              Didn't receive the code? Resend
            </Text>
          </Pressable>

          {/* Back */}
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>
              Back to Email Entry
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: isSmallScreen ? 16 : 20,
  },
  otpInput: {
    width: isSmallScreen ? 44 : 50,
    height: isSmallScreen ? 50 : 56,
    borderWidth: 2,
    borderColor: 'rgba(58, 93, 196, 0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '600',
    color: '#3a5dc4',
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: isSmallScreen ? 12 : 13,
    textAlign: 'center',
    marginBottom: isSmallScreen ? 12 : 16,
  },
  helpText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#3a5dc4',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: isSmallScreen ? 18 : 20,
    marginBottom: isSmallScreen ? 24 : 32,
  },
  verifyButton: {
    backgroundColor: '#3a5dc4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 14 : 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: isSmallScreen ? 16 : 20,
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
  verifyButtonText: {
    color: '#ffffff',
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  resendButtonText: {
    color: '#3a5dc4',
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#3a5dc4',
    fontSize: isSmallScreen ? 13 : 14,
    opacity: 0.8,
  },
});