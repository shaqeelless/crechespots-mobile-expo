import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

// Preload images
const preloadedImages = {
  splashScreen: require('@/assets/images/SplashScreen.png'),
};

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [lastError, setLastError] = useState('');

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imageUris = [
          Image.prefetch(Image.resolveAssetSource(preloadedImages.splashScreen).uri),
        ];
        
        await Promise.all(imageUris);
        setImagesLoaded(true);
      } catch (error) {
        console.log('Image preloading error:', error);
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, []);

  // Validation functions
  const validateForm = () => {
    const errors: any = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  const clearErrors = () => {
    setFormErrors({});
    setLastError('');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear last error when user starts typing in password field
    if (field === 'password' && lastError) {
      setLastError('');
    }
  };

  const handleLogin = async () => {
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstError = Object.values(errors)[0];
      Alert.alert('Please check your information', firstError as string);
      return;
    }

    // Clear errors if validation passes
    clearErrors();

    try {
      setLoading(true);
      const { error, data } = await signIn(formData.email, formData.password);
      
      if (error) {
        console.log('Login error details:', error);
        
        // Handle specific error types
        let errorMessage = 'Wrong password. Please try again.';
        
        // Supabase returns 400 Bad Request for invalid credentials
        if (error.status === 400) {
          errorMessage = 'Wrong password. Please check your password and try again.';
          setLastError('wrong_password');
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Wrong password. Please check your password and try again.';
          setLastError('wrong_password');
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before logging in. Check your inbox for the verification email.';
        } else if (error.message.includes('network') || error.message.includes('internet')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
        } else if (error.message.includes('badly formatted')) {
          errorMessage = 'Invalid email format. Please check your email address.';
        }

        Alert.alert('Login Error', errorMessage);

      } else {
        // Successfully logged in
        
        // Check if user needs to complete profile
        if (data?.user?.user_metadata?.profile_complete === false) {
          Alert.alert(
            'Welcome Back!',
            'Please complete your profile to continue.',
            [{ text: 'Continue', onPress: () => router.replace('/(tabs)/profile') }]
          );
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Wrong password. Please try again.';
      
      // Handle specific error types
      if (error?.status === 400) {
        errorMessage = 'Wrong password. Please check your password and try again.';
        setLastError('wrong_password');
      } else if (error?.code === 'NETWORK_ERROR') {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error?.code === 'TIMEOUT') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error?.message?.includes('JSON')) {
        errorMessage = 'Server response error. Please try again in a moment.';
      }

      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email.trim()) {
      Alert.alert(
        'Enter Your Email',
        'Please enter your email address first, then tap "Forgot Password" to reset it.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Enter Email', 
            onPress: () => {
              // Focus email input
            }
          }
        ]
      );
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address to reset your password.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Fix Email', 
            onPress: () => {
              // Focus email input
            }
          }
        ]
      );
      return;
    }

    // Navigate to forgot password with email pre-filled
    router.push({
      pathname: '/(auth)/forgot-password',
      params: { email: formData.email }
    });
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
              fadeDuration={0}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue finding trusted childcare</Text>

          {/* Password Help Tip */}
          {lastError === 'wrong_password' && (
            <View style={styles.helpTip}>
              <Text style={styles.helpTipText}>
                💡 Wrong password. Check for typing mistakes or reset your password.
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <View style={[styles.inputContainer, formErrors.email && styles.inputError]}>
              <Mail size={20} color="#3a5dc4" />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}

            <View style={[styles.inputContainer, formErrors.password && styles.inputError]}>
              <Lock size={20} color="#3a5dc4" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="current-password"
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

            <Pressable 
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                Forgot Password?
              </Text>
            </Pressable>
          </View>

          {/* Login Button */}
          <Pressable 
            style={[styles.loginButton, loading && styles.disabledButton]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </Pressable>

          {/* Register Link */}
          <Pressable 
            style={styles.registerContainer}
            onPress={() => router.push('/(auth)/onboarding')}
          >
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerLink}>Sign Up</Text>
            </Text>
          </Pressable>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Having trouble signing in?</Text>
            <Text style={styles.helpText}>
              • Check your password for typos{'\n'}
              • Make sure CAPS LOCK is off{'\n'}
              • Reset your password if needed
            </Text>
          </View>
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
  helpTip: {
    backgroundColor: '#ffebee',
    padding: isSmallScreen ? 12 : 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
    marginBottom: isSmallScreen ? 16 : 20,
  },
  helpTipText: {
    color: '#c62828',
    fontSize: isSmallScreen ? 12 : 13,
    textAlign: 'center',
    fontWeight: '500',
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#3a5dc4',
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#3a5dc4',
    paddingVertical: isSmallScreen ? 14 : 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: isSmallScreen ? 20 : 24,
    shadowColor: '#3a5dc4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
  },
  registerContainer: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? 20 : 24,
  },
  registerText: {
    textAlign: 'center',
    color: '#3a5dc4',
    fontSize: isSmallScreen ? 14 : 15,
    opacity: 0.9,
  },
  registerLink: {
    color: '#3a5dc4',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  helpSection: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: isSmallScreen ? 16 : 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 93, 196, 0.2)',
  },
  helpTitle: {
    color: '#3a5dc4',
    fontSize: isSmallScreen ? 14 : 15,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  helpText: {
    color: '#3a5dc4',
    fontSize: isSmallScreen ? 12 : 13,
    opacity: 0.8,
    lineHeight: isSmallScreen ? 16 : 18,
    textAlign: 'center',
  },
});