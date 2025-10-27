import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
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
        <Text style={styles.slogan}>Your Trusted Link to Easy Childcare</Text>
      </View>

      {/* Welcome Content */}
      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>Welcome to CrecheSpots</Text>
        <Text style={styles.welcomeDescription}>
          Join thousands of families finding trusted childcare in their community. 
          Whether you're looking for full-time care or occasional babysitting, 
          we've got you covered.
        </Text>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#f68484' }]}>
              <Text style={styles.featureEmoji}>🏠</Text>
            </View>
            <Text style={styles.featureText}>Verified Creches</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#9cdcb8' }]}>
              <Text style={styles.featureEmoji}>⭐</Text>
            </View>
            <Text style={styles.featureText}>Parent Reviews</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#84a7f6' }]}>
              <Text style={styles.featureEmoji}>📅</Text>
            </View>
            <Text style={styles.featureText}>Easy Booking</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Pressable 
          style={styles.parentButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.parentButtonText}>I'm a Parent</Text>
          <ArrowRight size={20} color="#ffffff" />
        </Pressable>
        
        <Pressable 
          style={styles.providerButton}
          onPress={() => router.push('/(auth)/provider-register')}
        >
          <Text style={styles.providerButtonText}>I'm a Childcare Provider</Text>
          <ArrowRight size={20} color="#bd84f6" />
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fcfe',
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  letterBlock: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1.5,
    opacity: 0.9,
  },
  letterText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoSubtext: {
    color: '#374151',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  slogan: {
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    opacity: 0.9,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 50,
  },
  parentButton: {
    backgroundColor: '#bd84f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  parentButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  providerButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#bd84f6',
    marginBottom: 24,
  },
  providerButtonText: {
    color: '#bd84f6',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loginText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#bd84f6',
    fontWeight: '600',
  },
});