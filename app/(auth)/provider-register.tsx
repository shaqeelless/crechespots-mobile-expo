import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building, Mail, Lock, Phone, MapPin } from 'lucide-react-native';

export default function ProviderRegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = () => {
    if (!formData.businessName || !formData.ownerName || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Here you would typically handle the provider registration logic
    console.log('Registering provider:', formData);
    
    Alert.alert(
      'Application Submitted',
      'Thank you for your interest! We will review your application within 24-48 hours and contact you via email.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/welcome') }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        
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

      <View style={styles.content}>
        <Text style={styles.title}>Join as a Provider</Text>
        <Text style={styles.subtitle}>Share your childcare services with families in your community</Text>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Building size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Business/Creche Name *"
              value={formData.businessName}
              onChangeText={(text) => setFormData({ ...formData, businessName: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Building size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Owner/Manager Name *"
              value={formData.ownerName}
              onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Business Email Address *"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Business Phone Number *"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Business Address *"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
            />
          </View>
        </View>

        {/* Requirements Info */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>What's Next?</Text>
          <Text style={styles.requirementsItem}>✓ Background verification & documentation</Text>
          <Text style={styles.requirementsItem}>✓ Safety inspection & certification check</Text>
          <Text style={styles.requirementsItem}>✓ Profile setup with photos and details</Text>
          <Text style={styles.requirementsItem}>✓ Account approval within 24-48 hours</Text>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          By submitting this application, you agree to our{' '}
          <Text style={styles.link}>Provider Terms</Text>,{' '}
          <Text style={styles.link}>Privacy Policy</Text>, and{' '}
          <Text style={styles.link}>Safety Standards</Text>
        </Text>

        {/* Submit Button */}
        <Pressable style={styles.submitButton} onPress={handleRegister}>
          <Text style={styles.submitButtonText}>Submit Application</Text>
        </Pressable>

        {/* Login Link */}
        <Pressable onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginText}>
            Already have a provider account? <Text style={styles.loginLink}>Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fcfe',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    paddingBottom: 32,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 32,
    top: 70,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  letterBlock: {
    width: 28,
    height: 28,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
    opacity: 0.9,
  },
  letterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoSubtext: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  content: {
    paddingHorizontal: 32,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  requirementsContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  requirementsItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  link: {
    color: '#bd84f6',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#bd84f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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