import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function PrivacyPolicies() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Privacy Policy</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.paragraph}>
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.
        </Text>
        <Text style={styles.subHeader}>Information We Collect</Text>
        <Text style={styles.paragraph}>
          We may collect personal information such as your name, email address, contact details, and usage data to provide and improve our services.
        </Text>
        <Text style={styles.subHeader}>How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          Your information is used to personalize your experience, communicate with you, and improve our app functionality.
        </Text>
        <Text style={styles.subHeader}>Data Security</Text>
        <Text style={styles.paragraph}>
          We implement appropriate security measures to protect your data from unauthorized access or disclosure.
        </Text>
        <Text style={styles.subHeader}>Third-Party Services</Text>
        <Text style={styles.paragraph}>
          We may share your information with trusted third-party providers to help operate our services, subject to confidentiality agreements.
        </Text>
        <Text style={styles.subHeader}>Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to access, update, or delete your personal information. Contact us anytime to exercise these rights.
        </Text>
        <Text style={styles.subHeader}>Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We encourage you to review this page periodically for any changes.
        </Text>
        <Text style={styles.footer}>
          Last updated: September 19, 2025
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#374151',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  footer: {
    marginTop: 32,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
