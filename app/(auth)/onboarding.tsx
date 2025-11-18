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
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, User, Mail, Phone, Camera, Check, Lock, ChevronDown } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;

// Preload images - reference them once
const preloadedImages = {
  onboarding1: require('@/assets/images/Onboardin-1.png'),
  onboarding2: require('@/assets/images/Onboardin-2.png'),
  splashScreen: require('@/assets/images/SplashScreen.png'),
};

// Country codes data
const countryCodes = [
  { code: '+1', flag: '🇺🇸', country: 'United States' },
  { code: '+44', flag: '🇬🇧', country: 'United Kingdom' },
  { code: '+61', flag: '🇦🇺', country: 'Australia' },
  { code: '+64', flag: '🇳🇿', country: 'New Zealand' },
  { code: '+27', flag: '🇿🇦', country: 'South Africa' },
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
    title: 'Welcome to crechespots',
    subtitle: 'Your Trusted Link to Easy Childcare',
    description: 'Browse verified creches and daycares in your area with detailed profiles, photos, and parent reviews.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
    image: preloadedImages.onboarding1,
  },
  {
    id: 2,
    title: 'Verified & Safe',
    subtitle: 'Peace of Mind for Parents',
    description: 'All childcare providers are thoroughly vetted with background checks, certifications, and safety inspections.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
    image: preloadedImages.onboarding2,
  },
  {
    id: 3,
    title: 'Apply Instantly',
    subtitle: 'Quick & Easy Applications',
    description: 'Submit applications to multiple creches instantly. Track your progress and get notifications when accepted.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
    image: preloadedImages.onboarding1,
  },
  {
    id: 4,
    title: "What's your name?",
    subtitle: 'Tell us about yourself',
    description: 'We need your name to create your parent profile and help creches get to know you.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
    isForm: true,
    formType: 'name',
    image: preloadedImages.onboarding1,
  },
  {
    id: 5,
    title: 'Contact information',
    subtitle: 'How can creches reach you?',
    description: 'We need your email and phone number so creches can contact you about applications.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
    isForm: true,
    formType: 'contact',
    image: preloadedImages.onboarding1,
  },
  {
    id: 6,
    title: 'Create Password',
    subtitle: 'Secure your account',
    description: 'Create a strong password to protect your account and personal information.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
    isForm: true,
    formType: 'password',
    image: preloadedImages.onboarding1,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1', // Default country code
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryCodeModal, setShowCountryCodeModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(1)).current;
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  // Preload and cache images
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imageUris = [
          Image.prefetch(Image.resolveAssetSource(preloadedImages.onboarding1).uri),
          Image.prefetch(Image.resolveAssetSource(preloadedImages.onboarding2).uri),
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

  const handleNext = async () => {
    const currentStep = onboardingSteps[currentIndex];
    
    // Validate form steps
    if (currentStep.isForm) {
      if (currentStep.formType === 'name') {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          Alert.alert('Required', 'Please enter your first and last name');
          return;
        }
      } else if (currentStep.formType === 'contact') {
        if (!formData.email.trim() || !formData.phone.trim()) {
          Alert.alert('Required', 'Please enter your email and phone number');
          return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          Alert.alert('Invalid Email', 'Please enter a valid email address');
          return;
        }

        // Phone number validation (basic - just check if it has numbers)
        const phoneRegex = /^[0-9]+$/;
        if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
          Alert.alert('Invalid Phone', 'Please enter a valid phone number');
          return;
        }
      } else if (currentStep.formType === 'password') {
        if (!formData.password.trim() || !formData.confirmPassword.trim()) {
          Alert.alert('Required', 'Please enter and confirm your password');
          return;
        }
        
        if (formData.password.length < 6) {
          Alert.alert('Weak Password', 'Password must be at least 6 characters long');
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
          return;
        }
        
        // Create account on final step
        await createAccount();
        return;
      }
    }

    if (currentIndex < onboardingSteps.length - 1) {
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
    }
  };

  const createAccount = async () => {
    try {
      setLoading(true);
      
      // Combine country code and phone number
      const fullPhoneNumber = `${formData.countryCode}${formData.phone}`;
      
      console.log('Attempting to create account with:', {
        email: formData.email,
        phone: fullPhoneNumber,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      // Create Supabase account - the trigger will automatically create the public.users record
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

      if (error) {
        // Don't show console error for email sending issues
        if (!error.message.includes('Error sending confirmation email')) {
          console.error('Supabase auth error:', error);
        }
        
        // If it's an email sending error, we still consider it a success
        // because the user account was created, just the email couldn't be sent
        if (error.message.includes('Error sending confirmation email')) {
          console.log('Account created but email sending failed. Proceeding to confirmation screen.');
          await handleSuccessfulAccountCreation(data?.user?.id, fullPhoneNumber, false);
          return;
        }
        
        throw error;
      }

      console.log('Auth response:', data);

      if (data.user) {
        console.log('User created successfully:', data.user.id);
        await handleSuccessfulAccountCreation(data.user.id, fullPhoneNumber, true);
      } else {
        throw new Error('No user data returned from authentication');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      
      // More specific error messages based on the error type
      if (error.message?.includes('User already registered')) {
        Alert.alert('Account Exists', 'An account with this email already exists. Please try logging in instead.');
      } else if (error.message?.includes('Invalid email')) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else if (error.message?.includes('Password')) {
        Alert.alert('Weak Password', 'Please choose a stronger password.');
      } else {
        Alert.alert(
          'Registration Failed', 
          'Unable to create account. Please check your internet connection and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulAccountCreation = async (userId: string | undefined, fullPhoneNumber: string, emailSent: boolean) => {
    try {
      if (userId) {
        // Wait a moment for the trigger to create the public.users record
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update the public.users record with the additional information
        await updateUserProfile(userId, fullPhoneNumber);
      }

      // Redirect to confirmation screen regardless of email sending status
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

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
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
            country_code: formData.countryCode,
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
              country_code: formData.countryCode,
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

  const renderFormContent = (step) => {
    switch (step.formType) {
      case 'name':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <User size={20} color="#3a5dc4" />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#666"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.inputContainer}>
              <User size={20} color="#3a5dc4" />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#666"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                autoCapitalize="words"
              />
            </View>
          </View>
        );
      
      case 'contact':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#3a5dc4" />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            <View style={styles.phoneInputContainer}>
              <Pressable 
                style={styles.countryCodeSelector}
                onPress={() => setShowCountryCodeModal(true)}
              >
                <Text style={styles.countryCodeText}>{formData.countryCode}</Text>
                <ChevronDown size={16} color="#3a5dc4" />
              </Pressable>
              <View style={styles.phoneInput}>
                <Phone size={20} color="#3a5dc4" />
                <TextInput
                  style={styles.phoneNumberInput}
                  placeholder="Phone Number"
                  placeholderTextColor="#666"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>
            </View>
            {renderCountryCodeModal()}
          </View>
        );
      
      case 'password':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#3a5dc4" />
              <TextInput
                style={styles.input}
                placeholder="Create Password"
                placeholderTextColor="#666"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
              />
              <Pressable 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeButtonText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#3a5dc4" />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#666"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="new-password"
              />
              <Pressable 
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeButtonText}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.passwordHint}>
              Password must be at least 6 characters long
            </Text>
          </View>
        );
      
      default:
        return null;
    }
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

          {currentStep.isForm && renderFormContent(currentStep)}
        </ScrollView>
      </Animated.View>

      {/* Footer */}
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
    </View>
  );
}

// ... (styles remain exactly the same as previous version)

// ... (styles remain the same as previous version)
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
  formContainer: {
    width: '100%',
    gap: isSmallScreen ? 12 : 16,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eyeButtonText: {
    color: '#3a5dc4',
    fontSize: 12,
    fontWeight: '600',
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
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