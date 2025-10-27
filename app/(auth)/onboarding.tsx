import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, User, Mail, Phone, Camera, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

// Add your logo image import here
// import LogoImage from '@/assets/images/logo.png';

const onboardingSteps = [
  {
    id: 1,
    title: 'Find Trusted Childcare',
    subtitle: 'Your Trusted Link to Easy Childcare',
    description: 'Browse verified creches and daycares in your area with detailed profiles, photos, and parent reviews.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
  },
  {
    id: 2,
    title: 'Verified & Safe',
    subtitle: 'Peace of Mind for Parents',
    description: 'All childcare providers are thoroughly vetted with background checks, certifications, and safety inspections.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
  },
  {
    id: 3,
    title: 'Apply Instantly',
    subtitle: 'Quick & Easy Applications',
    description: 'Submit applications to multiple creches instantly. Track your progress and get notifications when accepted.',
    backgroundColor: '#f4fcfe',
    color: '#3a5dc4',
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
  },
  {
    id: 5,
    title: 'Add a profile photo',
    subtitle: 'Let creches see who you are',
    description: 'A profile photo helps build trust with childcare providers. You can skip this step if you prefer.',
    backgroundColor: '#f4fcfe',
    color: '#ffffff',
    isForm: true,
    formType: 'photo',
  },
  {
    id: 6,
    title: 'Contact information',
    subtitle: 'How can creches reach you?',
    description: 'We need your email and phone number so creches can contact you about applications.',
    backgroundColor: '#f4fcfe',
    color: '#ffffff',
    isForm: true,
    formType: 'contact',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePhoto: null,
  });
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

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
        
        // Create account on final step
        await createAccount();
        return;
      }
    }

    if (currentIndex < onboardingSteps.length - 1) {
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
      
      // Create Supabase account
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: 'temp_password_' + Math.random().toString(36).substring(7), // Temporary password
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: formData.email,
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone_number: formData.phone,
              display_name: `${formData.firstName} ${formData.lastName}`,
              profile_picture_url: formData.profilePhoto || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png',
            },
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // Show verification screen
        Alert.alert(
          'Account Created!',
          'Please check your email to verify your account, then you can sign in.',
          [
            {
              text: 'Go to Login',
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/login');
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
                placeholderTextColor="#3a5dc4"
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
                placeholderTextColor="#3a5dc4"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                autoCapitalize="words"
              />
            </View>
          </View>
        );
      
      case 'photo':
        return (
          <View style={styles.photoContainer}>
            <View style={styles.photoPlaceholder}>
              {formData.profilePhoto ? (
                <Image source={{ uri: formData.profilePhoto }} style={styles.profileImage} />
              ) : (
                <Camera size={48} color="#3a5dc4" />
              )}
            </View>
            <Pressable style={styles.photoButton}>
              <Text style={styles.photoButtonText}>
                {formData.profilePhoto ? 'Change Photo' : 'Add Photo'}
              </Text>
            </Pressable>
            <Pressable onPress={handleNext}>
              <Text style={styles.skipText}>Skip for now</Text>
            </Pressable>
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
                placeholderTextColor="#3a5dc4"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <Phone size={20} color="#3a5dc4" />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#3a5dc4"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
            </View>
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
            source={require('@/assets/images/SplashScreen.png')} // Replace with your actual logo path
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        {/* Skip Button */}
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip to Login</Text>
        </Pressable>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
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
             currentStep.formType === 'contact' ? 'Create Account' : 
             currentStep.formType === 'photo' ? 'Continue' : 'Next'}
          </Text>
          {!loading && <ArrowRight size={20} color="#3a5dc4" />}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoImage: {
    width: 200, // Adjust based on your logo dimensions
    height: 60, // Adjust based on your logo dimensions
  },
  skipButton: {
    position: 'absolute',
    top: 0,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  skipButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  photoContainer: {
    alignItems: 'center',
    gap: 16,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  photoButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: '#bd84f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});