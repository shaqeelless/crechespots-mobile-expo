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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

// Preload images
const preloadedImages = {
  splashScreen: require('@/assets/images/SplashScreen.png'),
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const clearErrors = () => {
    setFormErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleResetPassword = async () => {
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstError = Object.values(errors)[0];
      Alert.alert('Please check your information', firstError);
      return;
    }

    // Clear errors if validation passes
    clearErrors();

    try {
      setLoading(true);

      // Update password using Supabase auth
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        console.error('Password reset error:', error);
        
        if (error.message.includes('session')) {
          Alert.alert('Session Expired', 'Your reset session has expired. Please start the process again.');
          router.replace('/(auth)/forgot-password');
        } else {
          Alert.alert('Error', 'Failed to reset password. Please try again.');
        }
      } else {
        // Success - show success message and redirect to login
        Alert.alert(
          'Password Reset Successful',
          'Your password has been updated successfully. You can now sign in with your new password.',
          [
            {
              text: 'Sign In',
              onPress: () => {
                router.replace('/(auth)/login');
              }
            }
          ]
        );
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
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Enter your new password below
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={[styles.inputContainer, formErrors.password && styles.inputError]}>
              <Lock size={20} color="#3a5dc4" />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#666"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
              />
              <Pressable 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#3a5dc4" />
                ) : (
                  <Eye size={20} color="#3a5dc4" />
                )}
              </Pressable>
            </View>
            {formErrors.password && <Text style={styles.errorText}>{formErrors.password}</Text>}

            <View style={[styles.inputContainer, formErrors.confirmPassword && styles.inputError]}>
              <Lock size={20} color="#3a5dc4" />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                placeholderTextColor="#666"
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="new-password"
              />
              <Pressable 
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#3a5dc4" />
                ) : (
                  <Eye size={20} color="#3a5dc4" />
                )}
              </Pressable>
            </View>
            {formErrors.confirmPassword && <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>}

            <Text style={styles.passwordHint}>
              Password must be at least 6 characters long
            </Text>
          </View>

          {/* Reset Button */}
          <Pressable 
            style={[styles.resetButton, loading && styles.disabledButton]} 
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>
              {loading ? 'Updating Password...' : 'Reset Password'}
            </Text>
            {!loading && <ArrowRight size={20} color="#ffffff" />}
          </Pressable>

          {/* Back to Login */}
          <Pressable 
            style={styles.backButton}
            onPress={() => router.replace('/(auth)/login')}
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
  eyeButton: {
    padding: 4,
  },
  passwordHint: {
    fontSize: isSmallScreen ? 12 : 13,
    color: '#3a5dc4',
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
    marginTop: 8,
  },
  resetButton: {
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
  resetButtonText: {
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