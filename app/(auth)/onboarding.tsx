import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Baby, Shield, Clock } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Find Trusted Childcare',
    subtitle: 'Your Trusted Link to Easy Childcare',
    description: 'Browse verified creches and daycares in your area with detailed profiles, photos, and parent reviews.',
    icon: Baby,
    backgroundColor: '#f68484',
    color: '#ffffff',
  },
  {
    id: 2,
    title: 'Verified & Safe',
    subtitle: 'Peace of Mind for Parents',
    description: 'All childcare providers are thoroughly vetted with background checks, certifications, and safety inspections.',
    icon: Shield,
    backgroundColor: '#9cdcb8',
    color: '#ffffff',
  },
  {
    id: 3,
    title: 'Book Instantly',
    subtitle: 'Quick & Easy Booking',
    description: 'Book childcare spots instantly or schedule visits. Real-time availability and flexible booking options.',
    icon: Clock,
    backgroundColor: '#84a7f6',
    color: '#ffffff',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
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
      router.push('/(auth)/welcome');
    }
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

  const currentData = onboardingData[currentIndex];
  const IconComponent = currentData.icon;

  return (
    <View style={[styles.container, { backgroundColor: currentData.backgroundColor }]}>
      {/* Header with Logo Spelling */}
      <View style={styles.header}>
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
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        {renderDots()}
        
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
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
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});