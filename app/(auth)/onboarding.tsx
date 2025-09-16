import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  Animated,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Baby, Shield, Clock, User, Mail, Phone, Camera, Skip } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Welcome to CrecheSpots',
    subtitle: 'Your Trusted Link to Easy Childcare',
    description: 'Let\'s get you set up with a personalized account to find the perfect childcare for your family.',
    icon: Baby,
    backgroundColor: '#f68484',
    color: '#ffffff',
    type: 'intro',
  },
  {
    id: 2,
    title: 'Tell us about yourself',
    subtitle: 'What should we call you?',
    description: 'We\'ll use this information to personalize your experience and help creches get to know you.',
    icon: User,
    backgroundColor: '#9cdcb8',
    color: '#ffffff',
    type: 'name',
  },
  {
    id: 3,
    title: 'Add your photo',
    subtitle: 'Let creches see who you are',
    description: 'A friendly photo helps build trust with childcare providers and makes your profile more personal.',
    icon: Camera,
    backgroundColor: '#84a7f6',
    color: '#ffffff',
    type: 'photo',
  },
  {
    id: 4,
    title: 'Contact Information',
    subtitle: 'How can creches reach you?',
    description: 'We need your email and phone number so creches can contact you about applications.',
    icon: Mail,
    backgroundColor: '#f6cc84',
    color: '#ffffff',
    type: 'contact',
  },
  {
    id: 5,
    title: 'Almost done!',
    subtitle: 'Verify your email address',
    description: 'We\'ve sent a verification email. Please check your inbox and click the link to activate your account.',
    icon: Shield,
    backgroundColor: '#bd84f6',
    color: '#ffffff',
    type: 'verify',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePicture: null,
  });
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleSkipToLogin = () => {
    router.push('/(auth)/login');
  };

  const handleNext = () => {
    const currentData = onboardingData[currentIndex];
    
    // Validate current step
    if (currentData.type === 'name') {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        Alert.alert('Required', 'Please enter your first and last name');
        return;
      }
    } else if (currentData.type === 'contact') {
      if (!formData.email.trim() || !formData.phone.trim()) {
        Alert.alert('Required', 'Please enter your email and phone number');
        return;
      }
      // Create account when contact info is complete
      handleCreateAccount();
      return;
    }

    if (currentIndex < onboardingData.length - 1) {
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

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      // Final step - go to login
      router.push('/(auth)/login');
    }
  };

  const handleCreateAccount = async () => {
    try {
      setLoading(true);
      
      // Create account with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: 'temp_password_123', // User will set this later
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
          }
        }
      });

      if (error) throw error;

      // Move to verification step
      handleNext();
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = () => {
    // Implement photo upload functionality
    Alert.alert('Photo Upload', 'Photo upload functionality would be implemented here');
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? '#bd4ab5' : '#e5e7eb',
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderStepContent = () => {
    const currentData = onboardingData[currentIndex];
    
    switch (currentData.type) {
      case 'name':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <User size={20} color="rgba(255,255,255,0.7)" />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              />
            </View>
            <View style={styles.inputContainer}>
              <User size={20} color="rgba(255,255,255,0.7)" />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              />
            </View>
          </View>
        );
      
      case 'photo':
        return (
          <View style={styles.photoContainer}>
            <Pressable style={styles.photoUpload} onPress={handlePhotoUpload}>
              {formData.profilePicture ? (
                <Image source={{ uri: formData.profilePicture }} style={styles.profileImage} />
              ) : (
                <>
                  <Camera size={40} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.photoUploadText}>Tap to add photo</Text>
                </>
              )}
            </Pressable>
            <Pressable style={styles.skipPhotoButton}>
              <Text style={styles.skipPhotoText}>Skip for now</Text>
            </Pressable>
          </View>
        );
      
      case 'contact':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Mail size={20} color="rgba(255,255,255,0.7)" />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <Phone size={20} color="rgba(255,255,255,0.7)" />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        );
      
      case 'verify':
        return (
          <View style={styles.verifyContainer}>
            <Text style={styles.verifyText}>
              We've sent a verification email to:
            </Text>
            <Text style={styles.emailText}>{formData.email}</Text>
            <Text style={styles.verifySubtext}>
              Please check your inbox and click the verification link to activate your account.
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  const currentData = onboardingData[currentIndex];
  const IconComponent = currentData.icon;

  return (
    <View style={[styles.container, { backgroundColor: currentData.backgroundColor }]}>
      {/* Header with Logo Spelling */}
      <View style={styles.header}>
        {currentIndex > 0 && (
          <Pressable style={styles.skipButton} onPress={handleSkipToLogin}>
            <Text style={styles.skipText}>Skip to Login</Text>
          </Pressable>
        )}
        
        <View style={styles.logoContainer}>
          <View style={[styles.letterBlock, { backgroundColor: '#f68484' }]}>
            <Text style={styles.letterText}>C</Text>
          </View>
          <View style={[styles.letterBlock, { backgroundColor: '#f68484' }]}>
            <Text style={styles.letterText}>R</Text>
          </View>
          <View style={[styles.letterBlock, { backgroundColor: '#9cdcb8' }]}>
            <Text style={styles.letterText}>E</Text>
          </View>
          <View style={[styles.letterBlock, { backgroundColor: '#84a7f6' }]}>
            <Text style={styles.letterText}>C</Text>
          </View>
          <View style={[styles.letterBlock, { backgroundColor: '#f6cc84' }]}>
            <Text style={styles.letterText}>H</Text>
          </View>
          <View style={[styles.letterBlock, { backgroundColor: '#bd84f6' }]}>
            <Text style={styles.letterText}>E</Text>
          </View>
        </View>
        <Text style={styles.logoSubtext}>SPOTS</Text>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          <IconComponent size={80} color={currentData.color} strokeWidth={1.5} />
        </View>

        <Text style={[styles.title, { color: currentData.color }]}>
          {currentData.title}
        </Text>
        
        <Text style={[styles.subtitle, { color: currentData.color }]}>
          {currentData.subtitle}
        </Text>

        <Text style={[styles.description, { color: currentData.color }]}>
          {currentData.description}
        </Text>

        {renderStepContent()}
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
             currentIndex === onboardingData.length - 1 ? 'Continue to Login' : 
             currentData.type === 'contact' ? 'Create Account' : 'Next'}
          </Text>
          <ArrowRight size={20} color="#ffffff" />
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
  skipButton: {
    position: 'absolute',
    top: 0,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  skipText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  letterBlock: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    opacity: 0.9,
  },
  letterText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoSubtext: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
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
    gap: 20,
  },
  photoUpload: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoUploadText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 8,
  },
  skipPhotoButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  skipPhotoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  verifyContainer: {
    alignItems: 'center',
    gap: 12,
  },
  verifyText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
  },
  emailText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  verifySubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
    backgroundColor: '#bd4ab5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});