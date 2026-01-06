import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  TextInput,
  Alert,
  Image,
  Animated,
  ScrollView,
  Modal,
  FlatList,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, User, Mail, Phone, Camera, Check, Lock, ChevronDown, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';

// Required for Expo OAuth
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

// Preload images - reference them once
const preloadedImages = {
  onboarding1: require('@/assets/images/Onboardin-1.png'),
  onboarding2: require('@/assets/images/Onboardin-2.png'),
  onboarding3: require('@/assets/images/Onboardin-3.png'),
  onboarding4: require('@/assets/images/Onboardin-4.png'),
  onboarding5: require('@/assets/images/Onboardin-5.png'),
  onboarding6: require('@/assets/images/Onboardin-6.png'),
  splashScreen: require('@/assets/images/SplashScreen.png'),
  googleIcon: require('@/assets/images/google-icon.png'),
  facebookIcon: require('@/assets/images/facebook-icon.png'),
};

// Country codes data - South Africa first
const countryCodes = [
  { code: '+27', flag: '🇿🇦', country: 'South Africa' },
  { code: '+1', flag: '🇺🇸', country: 'United States' },
  { code: '+44', flag: '🇬🇧', country: 'United Kingdom' },
  { code: '+61', flag: '🇦🇺', country: 'Australia' },
  { code: '+64', flag: '🇳🇿', country: 'New Zealand' },
  { code: '+91', flag: '🇮🇳', country: 'India' },
  { code: '+86', flag: '🇨🇳', country: 'China' },
  { code: '+81', flag: '🇯🇵', country: 'Japan' },
  { code: '+82', flag: '🇰🇷', country: 'South Korea' },
  { code: '+65', flag: '🇸🇬', country: 'Singapore' },
  { code: '+60', flag: '🇲🇾', country: 'Malaysia' },
  { code: '+971', flag: '🇦🇪', country: 'UAE' },
  { code: '+966', flag: '🇸🇦', country: 'Saudi Arabia' },
  { code: '+20', flag: '🇪🇬', country: 'Egypt' },
  { code: '+234', flag: '🇳🇬', country: 'Nigeria' },
  { code: '+254', flag: '🇰🇪', country: 'Kenya' },
  { code: '+33', flag: '🇫🇷', country: 'France' },
  { code: '+49', flag: '🇩🇪', country: 'Germany' },
  { code: '+39', flag: '🇮🇹', country: 'Italy' },
  { code: '+34', flag: '🇪🇸', country: 'Spain' },
  { code: '+31', flag: '🇳🇱', country: 'Netherlands' },
  { code: '+41', flag: '🇨🇭', country: 'Switzerland' },
  { code: '+46', flag: '🇸🇪', country: 'Sweden' },
  { code: '+47', flag: '🇳🇴', country: 'Norway' },
  { code: '+45', flag: '🇩🇰', country: 'Denmark' },
  { code: '+55', flag: '🇧🇷', country: 'Brazil' },
  { code: '+52', flag: '🇲🇽', country: 'Mexico' },
  { code: '+51', flag: '🇵🇪', country: 'Peru' },
  { code: '+54', flag: '🇦🇷', country: 'Argentina' },
  { code: '+56', flag: '🇨🇱', country: 'Chile' },
];

const onboardingSteps = [
  {
    id: 1,
    title: 'Welcome to the Crechespots Family',
    subtitle: 'Where Parents & Caregivers Come Together',
    description: 'Explore trusted creches and daycares nearby — with real stories, photos, and experiences from families just like yours.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
    image: preloadedImages.onboarding4,
  },
  {
    id: 2,
    title: 'Care You Can Count On',
    subtitle: 'Because Your Little One Deserves the Best',
    description: 'Every creche in our community is carefully verified — from safety checks to certifications — so you can feel confident and supported.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
    image: preloadedImages.onboarding2,
  },
  {
    id: 3,
    title: 'Join In With Ease',
    subtitle: 'Simple, Stress-Free Applications',
    description: 'Apply to multiple creches in just a tap. Stay in the loop with updates, and celebrate with us when you get accepted!',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
    image: preloadedImages.onboarding1,
  },
  {
    id: 4,
    title: 'Choose Your Sign Up Method',
    subtitle: 'Get started quickly',
    description: 'Sign up instantly with Google or Facebook, or continue with email registration.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
    isSocialLogin: true, // New step for social login choice
    image: preloadedImages.onboarding5,
  },
  {
    id: 5,
    title: 'Let\'s Get to Know You',
    subtitle: 'We\'re Happy You\'re Here',
    description: 'Tell us your name so we can set up your parent profile and help our creche community welcome you properly.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
    isForm: true,
    formType: 'name',
    image: preloadedImages.onboarding5,
  },
  {
    id: 6,
    title: 'Stay Connected',
    subtitle: 'So Creches Can Reach Out',
    description: 'Share your email and phone number so creches can easily connect with you about openings and updates.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
    isForm: true,
    formType: 'contact',
    image: preloadedImages.onboarding6,
  },
  {
    id: 7,
    title: 'Almost There!',
    subtitle: 'Let\'s Keep Your Space Secure',
    description: 'Create a password to protect your account — your info is safe with your new Crechespots family.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
    isForm: true,
    formType: 'password',
    image: preloadedImages.onboarding1,
  },
];

// Password strength checker
const checkPasswordStrength = (password: string) => {
  if (!password) return { strength: 0, feedback: [] };

  const feedback = [];
  let strength = 0;

  // Length check
  if (password.length >= 8) {
    strength += 1;
  } else {
    feedback.push('At least 8 characters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('One uppercase letter (A-Z)');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('One lowercase letter (a-z)');
  }

  // Number check
  if (/\d/.test(password)) {
    strength += 1;
  } else {
    feedback.push('One number (0-9)');
  }

  // Symbol check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strength += 1;
  } else {
    feedback.push('One symbol (!@#$% etc.)');
  }

  return { strength, feedback };
};

const getStrengthColor = (strength: number) => {
  switch (strength) {
    case 0: return '#ff6b6b';
    case 1: return '#ff6b6b';
    case 2: return '#ffa726';
    case 3: return '#ffd54f';
    case 4: return '#9cdcb8';
    case 5: return '#66bb6a';
    default: return '#ff6b6b';
  }
};

const getStrengthLabel = (strength: number) => {
  switch (strength) {
    case 0: return 'Very Weak';
    case 1: return 'Weak';
    case 2: return 'Fair';
    case 3: return 'Good';
    case 4: return 'Strong';
    case 5: return 'Very Strong';
    default: return 'Very Weak';
  }
};

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+27', // South Africa as default
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryCodeModal, setShowCountryCodeModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, feedback: [] });
  const [showPasswordFeedback, setShowPasswordFeedback] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(1)).current;
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  // Update password strength when password changes
  useEffect(() => {
    const strength = checkPasswordStrength(formData.password);
    setPasswordStrength(strength);
  }, [formData.password]);

  // Preload and cache images
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imageUris = [
          Image.prefetch(Image.resolveAssetSource(preloadedImages.onboarding1).uri),
          Image.prefetch(Image.resolveAssetSource(preloadedImages.onboarding2).uri),
          Image.prefetch(Image.resolveAssetSource(preloadedImages.onboarding3).uri),
          Image.prefetch(Image.resolveAssetSource(preloadedImages.onboarding4).uri),
          Image.prefetch(Image.resolveAssetSource(preloadedImages.onboarding5).uri),
          Image.prefetch(Image.resolveAssetSource(preloadedImages.onboarding6).uri),
          Image.prefetch(Image.resolveAssetSource(preloadedImages.splashScreen).uri),
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

  // Social login functions
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Generate redirect URL based on platform
      let redirectUrl;
      
      if (Platform.OS === 'web') {
        redirectUrl = 'https://crechespots.com/auth/callback';
      } else {
        redirectUrl = 'crechespots://auth/callback';
      }

      console.log('Google OAuth - Redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) throw error;

      // For mobile, open the OAuth URL
      if (Platform.OS !== 'web' && data?.url) {
        console.log('Opening WebBrowser for Google OAuth');
        
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
          {
            showTitle: false,
            enableBarCollapsing: true,
            createTask: false,
            preferEphemeralSession: false,
          }
        );

        console.log('OAuth Result Type:', result.type);

        if (result.type === 'success' && result.url) {
          console.log('OAuth successful, result URL:', result.url);
          
          const { queryParams } = Linking.parse(result.url);
          console.log('Query params from OAuth:', queryParams);
          
          if (queryParams?.error) {
            throw new Error(queryParams.error_description || queryParams.error || 'Authentication failed');
          }
          
          if (queryParams?.access_token) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: queryParams.access_token as string,
              refresh_token: queryParams.refresh_token as string,
            });
            
            if (sessionError) throw sessionError;
            
            console.log('Google OAuth successful, redirecting to home');
            router.replace('/(app)/(tabs)/home');
          } else {
            console.log('No direct tokens, navigating to callback screen');
            router.push('/auth/callback');
          }
        } else if (result.type === 'cancel') {
          throw new Error('Authentication cancelled by user');
        } else {
          console.log('WebBrowser result:', result);
          throw new Error('Authentication failed or browser closed');
        }
      }
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      Alert.alert('Google Sign In Failed', error.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setFacebookLoading(true);
    
    try {
      // Generate redirect URL based on platform
      let redirectUrl;
      
      if (Platform.OS === 'web') {
        redirectUrl = 'https://crechespots.com/auth/callback';
      } else {
        redirectUrl = 'crechespots://auth/callback';
      }

      console.log('Facebook OAuth - Redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) throw error;

      if (Platform.OS !== 'web' && data?.url) {
        console.log('Opening WebBrowser for Facebook OAuth');
        
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
          {
            showTitle: false,
            enableBarCollapsing: true,
            createTask: false,
            preferEphemeralSession: false,
          }
        );

        console.log('Facebook OAuth Result Type:', result.type);

        if (result.type === 'success' && result.url) {
          console.log('Facebook OAuth successful, result URL:', result.url);
          
          const { queryParams } = Linking.parse(result.url);
          console.log('Query params from Facebook OAuth:', queryParams);
          
          if (queryParams?.error) {
            throw new Error(queryParams.error_description || queryParams.error || 'Authentication failed');
          }
          
          if (queryParams?.access_token) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: queryParams.access_token as string,
              refresh_token: queryParams.refresh_token as string,
            });
            
            if (sessionError) throw sessionError;
            
            console.log('Facebook OAuth successful, redirecting to home');
            router.replace('/(app)/(tabs)/home');
          } else {
            console.log('No direct tokens, navigating to callback screen');
            router.push('/auth/callback');
          }
        } else if (result.type === 'cancel') {
          throw new Error('Authentication cancelled by user');
        } else {
          console.log('Facebook WebBrowser result:', result);
          throw new Error('Authentication failed or browser closed');
        }
      }
      
    } catch (error: any) {
      console.error('Facebook sign-in error:', error);
      Alert.alert('Facebook Sign In Failed', error.message || 'Facebook sign-in failed. Please try again.');
    } finally {
      setFacebookLoading(false);
    }
  };

  // Validation functions
  const validateName = () => {
    const errors = {};
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    return errors;
  };

  const validateContact = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^[0-9]{9,15}$/;
      const cleanPhone = formData.phone.replace(/\s/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.phone = 'Please enter a valid phone number (9-15 digits)';
      }
    }
    
    return errors;
  };

  const validatePassword = () => {
    const errors = {};
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (passwordStrength.strength < 3) {
      errors.password = 'Please choose a stronger password';
      setShowPasswordFeedback(true);
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

  const handleNext = async () => {
    console.log(`🔄 handleNext called for step ${currentIndex + 1}`);
    const currentStep = onboardingSteps[currentIndex];
    
    // Skip validation for social login step
    if (currentStep.isSocialLogin) {
      // Move to next step (name form)
      navigateToNextStep();
      return;
    }
    
    // Validate form steps
    if (currentStep.isForm) {
      let errors = {};
      
      if (currentStep.formType === 'name') {
        errors = validateName();
      } else if (currentStep.formType === 'contact') {
        errors = validateContact();
      } else if (currentStep.formType === 'password') {
        errors = validatePassword();
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        
        // Show first error in alert for better visibility
        const firstError = Object.values(errors)[0];
        Alert.alert('Please check your information', firstError);
        return;
      }

      // Clear errors if validation passes
      clearErrors();
    }

    // If this is the password step (last step), create the account
    if (currentStep.formType === 'password') {
      console.log('🔐 Creating account...');
      await createAccount();
      return; // Stop here, don't increment index
    }

    // For all other steps, proceed to next step
    if (currentIndex < onboardingSteps.length - 1) {
      navigateToNextStep();
    }
  };

  const navigateToNextStep = () => {
    // Smooth image transition
    Animated.sequence([
      Animated.parallel([
        Animated.timing(imageOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(imageScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(imageScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Content fade animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentIndex(currentIndex + 1);
  };

  const handleContinueWithEmail = () => {
    // Skip to the name form step
    setCurrentIndex(4); // Skip to step 5 (name form)
  };

  const createAccount = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting account creation process...');
      
      // Combine country code and phone number
      const fullPhoneNumber = `${formData.countryCode}${formData.phone}`;
      
      console.log('📝 Account details:', {
        email: formData.email,
        phone: fullPhoneNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        passwordLength: formData.password.length,
        passwordStrength: passwordStrength.strength
      });

      // Create Supabase account
      console.log('🔐 Calling Supabase auth.signUp...');
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: fullPhoneNumber,
            display_name: `${formData.firstName} ${formData.lastName}`,
          }
        }
      });

      console.log('📨 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        
        // Enhanced error handling with specific messages
        let errorMessage = 'Unable to create account. Please try again.';
        let errorType = 'UNKNOWN_ERROR';
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
          errorType = 'EMAIL_EXISTS';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
          errorType = 'INVALID_EMAIL';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Your password is too short. Please use at least 6 characters.';
          errorType = 'PASSWORD_TOO_SHORT';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Your password does not meet the security requirements. Please include uppercase, lowercase, numbers, and symbols.';
          errorType = 'WEAK_PASSWORD';
        } else if (error.message.includes('network') || error.message.includes('internet')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
          errorType = 'NETWORK_ERROR';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many attempts. Please wait a moment and try again.';
          errorType = 'RATE_LIMIT';
        }
        
        console.log(`🔍 Error type: ${errorType}`);
        throw new Error(errorType);
      }

      if (data.user) {
        console.log('✅ User created successfully:', data.user.id);
        await handleSuccessfulAccountCreation(data.user.id, fullPhoneNumber);
      } else {
        console.error('❌ No user data returned');
        throw new Error('NO_USER_DATA');
      }
    } catch (error) {
      console.error('💥 Error creating account:', error);
      
      // User-friendly error messages based on error type
      let errorMessage = 'Unable to create account. Please try again.';
      let showPasswordHelp = false;
      
      switch (error.message) {
        case 'EMAIL_EXISTS':
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
          break;
        case 'INVALID_EMAIL':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'PASSWORD_TOO_SHORT':
          errorMessage = 'Your password is too short. Please use at least 6 characters.';
          showPasswordHelp = true;
          break;
        case 'WEAK_PASSWORD':
          errorMessage = 'Your password does not meet security requirements. Please include uppercase, lowercase, numbers, and symbols.';
          showPasswordHelp = true;
          break;
        case 'NETWORK_ERROR':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'RATE_LIMIT':
          errorMessage = 'Too many attempts. Please wait a moment and try again.';
          break;
        case 'NO_USER_DATA':
          errorMessage = 'Account creation failed. Please try again.';
          break;
      }
      
      Alert.alert(
        'Registration Failed', 
        errorMessage,
        showPasswordHelp ? [
          {
            text: 'Fix Password',
            onPress: () => setShowPasswordFeedback(true)
          },
          { text: 'OK' }
        ] : undefined
      );
      
      if (showPasswordHelp) {
        setShowPasswordFeedback(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulAccountCreation = async (userId: string | undefined, fullPhoneNumber: string) => {
    try {
      if (userId) {
        // Wait a moment for the trigger to create the public.users record
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update the public.users record with the additional information
        await updateUserProfile(userId, fullPhoneNumber);
      }

      // Redirect to confirmation screen
      router.replace('/(auth)/confirm-email');
      
    } catch (error) {
      console.error('Error in handleSuccessfulAccountCreation:', error);
      // Even if there are issues, still redirect to confirmation screen
      router.replace('/(auth)/confirm-email');
    }
  };

  const updateUserProfile = async (userId: string, fullPhoneNumber: string) => {
    try {
      // First check if the user profile exists (it should be created by the trigger)
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', fetchError);
        return;
      }

      if (existingUser) {
        // Update the existing profile with additional information
        const { error: updateError } = await supabase
          .from('users')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: fullPhoneNumber,
            display_name: `${formData.firstName} ${formData.lastName}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user profile:', updateError);
        } else {
          console.log('Profile updated successfully');
        }
      } else {
        // If for some reason the trigger didn't work, create the profile
        console.warn('User profile not found, creating manually...');
        const { error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: userId,
              email: formData.email,
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone_number: fullPhoneNumber,
              display_name: `${formData.firstName} ${formData.lastName}`,
              profile_picture_url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (createError) {
          console.error('Error creating user profile:', createError);
        } else {
          console.log('Profile created successfully');
        }
      }
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/login');
  };

  const selectCountryCode = (country) => {
    setFormData({ ...formData, countryCode: country.code });
    setShowCountryCodeModal(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {onboardingSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? '#bd84f6' : '#3a5dc4',
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderCountryCodeModal = () => (
    <Modal
      visible={showCountryCodeModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCountryCodeModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country Code</Text>
            <Pressable 
              style={styles.closeButton}
              onPress={() => setShowCountryCodeModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
          <FlatList
            data={countryCodes}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <Pressable
                style={styles.countryItem}
                onPress={() => selectCountryCode(item)}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <Text style={styles.countryCode}>{item.code}</Text>
                <Text style={styles.countryName}>{item.country}</Text>
              </Pressable>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  const renderPasswordStrength = () => {
    if (!formData.password) return null;

    return (
      <View style={styles.passwordStrengthContainer}>
        <View style={styles.strengthHeader}>
          <Text style={styles.strengthLabel}>Password Strength:</Text>
          <Text style={[styles.strengthValue, { color: getStrengthColor(passwordStrength.strength) }]}>
            {getStrengthLabel(passwordStrength.strength)}
          </Text>
        </View>
        
        <View style={styles.strengthBar}>
          {[1, 2, 3, 4, 5].map((index) => (
            <View
              key={index}
              style={[
                styles.strengthSegment,
                {
                  backgroundColor: index <= passwordStrength.strength 
                    ? getStrengthColor(passwordStrength.strength)
                    : '#e0e0e0',
                },
              ]}
            />
          ))}
        </View>

        {(showPasswordFeedback || passwordStrength.strength < 3) && passwordStrength.feedback.length > 0 && (
          <View style={styles.feedbackContainer}>
            <AlertCircle size={16} color="#ff6b6b" />
            <Text style={styles.feedbackTitle}>Your password should include:</Text>
            {passwordStrength.feedback.map((item, index) => (
              <Text key={index} style={styles.feedbackItem}>
                • {item}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderSocialLoginButtons = () => {
    return (
      <View style={styles.socialLoginContainer}>
        <View style={styles.socialButtonsRow}>
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: '#FFFFFF' }]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading || loading}
          >
            <Image
              source={preloadedImages.googleIcon}
              style={styles.socialIcon}
              resizeMode="contain"
            />
            {googleLoading && (
              <View style={styles.socialButtonLoading}>
                <Text style={styles.socialButtonLoadingText}>...</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
            onPress={handleFacebookSignIn}
            disabled={facebookLoading || loading}
          >
            <Image
              source={preloadedImages.facebookIcon}
              style={[styles.socialIcon, styles.facebookIcon]}
              resizeMode="contain"
            />
            {facebookLoading && (
              <View style={styles.socialButtonLoading}>
                <Text style={styles.socialButtonLoadingText}>...</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>
        
        <Pressable 
          style={[styles.emailButton, loading && styles.disabledButton]} 
          onPress={handleContinueWithEmail}
          disabled={loading}
        >
          <Text style={styles.emailButtonText}>
            Continue with Email
          </Text>
          <ArrowRight size={20} color="#3a5dc4" />
        </Pressable>
      </View>
    );
  };

  const renderFormContent = (step) => {
    switch (step.formType) {
      case 'name':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <User size={20} color="#3a5dc4" />
              <TextInput
                style={[styles.input, formErrors.firstName && styles.inputError]}
                placeholder="First Name"
                placeholderTextColor="#666"
                value={formData.firstName}
                onChangeText={(text) => handleInputChange('firstName', text)}
                autoCapitalize="words"
              />
            </View>
            {formErrors.firstName && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#ff6b6b" />
                <Text style={styles.errorText}>{formErrors.firstName}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <User size={20} color="#3a5dc4" />
              <TextInput
                style={[styles.input, formErrors.lastName && styles.inputError]}
                placeholder="Last Name"
                placeholderTextColor="#666"
                value={formData.lastName}
                onChangeText={(text) => handleInputChange('lastName', text)}
                autoCapitalize="words"
              />
            </View>
            {formErrors.lastName && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#ff6b6b" />
                <Text style={styles.errorText}>{formErrors.lastName}</Text>
              </View>
            )}
          </View>
        );
      
      case 'contact':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#3a5dc4" />
              <TextInput
                style={[styles.input, formErrors.email && styles.inputError]}
                placeholder="Email Address"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {formErrors.email && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#ff6b6b" />
                <Text style={styles.errorText}>{formErrors.email}</Text>
              </View>
            )}

            <View style={styles.phoneInputContainer}>
              <Pressable 
                style={styles.countryCodeSelector}
                onPress={() => setShowCountryCodeModal(true)}
              >
                <Text style={styles.countryCodeText}>{formData.countryCode}</Text>
                <ChevronDown size={16} color="#3a5dc4" />
              </Pressable>
              <View style={[styles.phoneInput, formErrors.phone && styles.inputError]}>
                <Phone size={20} color="#3a5dc4" />
                <TextInput
                  style={styles.phoneNumberInput}
                  placeholder="Phone Number"
                  placeholderTextColor="#666"
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>
            </View>
            {formErrors.phone && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#ff6b6b" />
                <Text style={styles.errorText}>{formErrors.phone}</Text>
              </View>
            )}
            {renderCountryCodeModal()}
          </View>
        );
      
      case 'password':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#3a5dc4" />
              <TextInput
                style={[styles.input, formErrors.password && styles.inputError]}
                placeholder="Create Password"
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
            {formErrors.password && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#ff6b6b" />
                <Text style={styles.errorText}>{formErrors.password}</Text>
              </View>
            )}

            {renderPasswordStrength()}

            <View style={styles.inputContainer}>
              <Lock size={20} color="#3a5dc4" />
              <TextInput
                style={[styles.input, formErrors.confirmPassword && styles.inputError]}
                placeholder="Confirm Password"
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
            {formErrors.confirmPassword && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#ff6b6b" />
                <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>
              </View>
            )}
            
            <Text style={styles.passwordHint}>
              For maximum security, include uppercase, lowercase, numbers, and symbols
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  const renderSocialLoginStep = () => {
    return (
      <View style={styles.socialStepContainer}>
        {renderSocialLoginButtons()}
      </View>
    );
  };

  const currentStep = onboardingSteps[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: currentStep.backgroundColor }]}>
      {/* Header with Logo Image */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={preloadedImages.splashScreen}
            style={styles.logoImage}
            resizeMode="contain"
            fadeDuration={0}
          />
        </View>
        
        {/* Skip Button */}
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip to Login</Text>
        </Pressable>
      </View>

      {/* Onboarding Image with Better Loading */}
      <Animated.View 
        style={[
          styles.imageContainer,
          { 
            transform: [{ scale: imageScale }],
            opacity: imageOpacity 
          }
        ]}
      >
        <Image 
          source={currentStep.image}
          style={styles.onboardingImage}
          resizeMode="contain"
          fadeDuration={0}
        />
        {/* Loading skeleton - only shows briefly if images aren't preloaded yet */}
        {!imagesLoaded && (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Loading...</Text>
          </View>
        )}
      </Animated.View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: currentStep.color }]}>
            {currentStep.title}
          </Text>
          
          <Text style={[styles.subtitle, { color: currentStep.color }]}>
            {currentStep.subtitle}
          </Text>

          <Text style={[styles.description, { color: currentStep.color }]}>
            {currentStep.description}
          </Text>

          {currentStep.isSocialLogin && renderSocialLoginStep()}
          {currentStep.isForm && renderFormContent(currentStep)}
        </ScrollView>
      </Animated.View>

      {/* Footer - Hide dots and next button on social login step */}
      {!currentStep.isSocialLogin && (
        <View style={styles.footer}>
          {renderDots()}
          
          <Pressable 
            style={[styles.nextButton, loading && styles.disabledButton]} 
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.nextButtonText}>
              {loading ? 'Creating Account...' : 
               currentStep.formType === 'password' ? 'Create Account' : 'Next'}
            </Text>
            {!loading && <ArrowRight size={20} color="#ffffff" />}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: isSmallScreen ? 40 : 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: isSmallScreen ? 10 : 20,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  logoImage: {
    width: isSmallScreen ? 160 : 200,
    height: isSmallScreen ? 45 : 60,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(58, 93, 196, 0.1)',
  },
  skipButtonText: {
    color: '#3a5dc4',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isSmallScreen ? 10 : 20,
    paddingHorizontal: 20,
    height: isSmallScreen ? 150 : 200,
  },
  onboardingImage: {
    width: width * 0.7,
    height: '100%',
    maxHeight: isSmallScreen ? 150 : 200,
  },
  imagePlaceholder: {
    position: 'absolute',
    width: width * 0.7,
    height: '100%',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: isSmallScreen ? 8 : 12,
  },
  subtitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: isSmallScreen ? 12 : 16,
  },
  description: {
    fontSize: isSmallScreen ? 14 : 16,
    textAlign: 'center',
    lineHeight: isSmallScreen ? 20 : 24,
    opacity: 0.9,
    marginBottom: isSmallScreen ? 24 : 32,
  },
  socialStepContainer: {
    width: '100%',
    marginTop: isSmallScreen ? 10 : 20,
  },
  formContainer: {
    width: '100%',
    gap: isSmallScreen ? 8 : 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: isSmallScreen ? 12 : 16,
    borderWidth: 1,
    borderColor: 'rgba(58, 93, 196, 0.3)',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: isSmallScreen ? 14 : 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginLeft: 8,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: isSmallScreen ? 12 : 13,
  },
  // Phone input styles
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 93, 196, 0.3)',
    overflow: 'hidden',
  },
  countryCodeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: isSmallScreen ? 12 : 16,
    backgroundColor: 'rgba(58, 93, 196, 0.1)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(58, 93, 196, 0.3)',
    gap: 8,
  },
  countryCodeText: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#3a5dc4',
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: isSmallScreen ? 12 : 16,
  },
  phoneNumberInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: isSmallScreen ? 14 : 16,
    color: '#333',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#3a5dc4',
    fontSize: 16,
    fontWeight: '600',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: 60,
  },
  countryName: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  eyeButton: {
    padding: 4,
  },
  passwordStrengthContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  feedbackContainer: {
    padding: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b6b',
  },
  feedbackTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff6b6b',
    marginBottom: 4,
  },
  feedbackItem: {
    fontSize: 11,
    color: '#666',
    marginLeft: 8,
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Social login styles
  socialLoginContainer: {
    marginTop: isSmallScreen ? 10 : 20,
    alignItems: 'center',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: isSmallScreen ? 20 : 30,
    marginBottom: isSmallScreen ? 20 : 30,
  },
  socialButton: {
    width: isSmallScreen ? 60 : 70,
    height: isSmallScreen ? 60 : 70,
    borderRadius: isSmallScreen ? 30 : 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  socialIcon: {
    width: isSmallScreen ? 28 : 32,
    height: isSmallScreen ? 28 : 32,
  },
  facebookIcon: {
  },
  socialButtonLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: isSmallScreen ? 30 : 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonLoadingText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: '#3a5dc4',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: isSmallScreen ? 20 : 24,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(58, 93, 196, 0.3)',
  },
  dividerText: {
    color: '#3a5dc4',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '500',
    marginHorizontal: isSmallScreen ? 12 : 16,
  },
  emailButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 14 : 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3a5dc4',
    gap: 8,
    width: '100%',
  },
  emailButtonText: {
    color: '#3a5dc4',
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: isSmallScreen ? 30 : 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: isSmallScreen ? 20 : 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: '#3a5dc4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 14 : 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
  },
});