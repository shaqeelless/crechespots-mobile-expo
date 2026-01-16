import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Trash2,
  Check,
  X,
  Lock,
  Calendar,
  User,
  Construction,
  Shield,
  Wallet,
  Key,
} from 'lucide-react-native';

export default function PaymentMethodsScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for a better UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#bd84f6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Feature Coming Soon Message */}
        <View style={styles.comingSoonSection}>
          <View style={styles.comingSoonIconContainer}>
            <Construction size={48} color="#bd84f6" />
          </View>
          <Text style={styles.comingSoonTitle}>
            Feature Coming Soon
          </Text>
          <Text style={styles.comingSoonText}>
            The payment methods feature is currently under development. We're working hard to bring you a secure and convenient way to manage your payment options.
          </Text>
        </View>

        {/* Security Information */}
        <View style={styles.securitySection}>
          <View style={styles.securityHeader}>
            <Shield size={24} color="#10b981" />
            <Text style={styles.securityTitle}>Security First</Text>
          </View>
          <Text style={styles.securityText}>
            When this feature launches, your payment information will be:
          </Text>
          
          <View style={styles.securityList}>
            <View style={styles.securityItem}>
              <View style={[styles.securityIcon, { backgroundColor: '#f0fdf4' }]}>
                <Lock size={16} color="#10b981" />
              </View>
              <Text style={styles.securityItemText}>
                Encrypted with bank-level security
              </Text>
            </View>
            
            <View style={styles.securityItem}>
              <View style={[styles.securityIcon, { backgroundColor: '#fef2f2' }]}>
                <Key size={16} color="#ef4444" />
              </View>
              <Text style={styles.securityItemText}>
                Never stored in plain text
              </Text>
            </View>
            
            <View style={styles.securityItem}>
              <View style={[styles.securityIcon, { backgroundColor: '#f0f9ff' }]}>
                <Shield size={16} color="#0ea5e9" />
              </View>
              <Text style={styles.securityItemText}>
                Protected by industry standards
              </Text>
            </View>
          </View>
        </View>

        {/* What to Expect Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What You'll Be Able To Do</Text>
          
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#fef2f8' }]}>
              <CreditCard size={24} color="#db2777" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Add Multiple Cards</Text>
              <Text style={styles.featureDescription}>
                Store multiple credit or debit cards for easy access during checkout.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#f0f9ff' }]}>
              <Wallet size={24} color="#0ea5e9" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Set Default Method</Text>
              <Text style={styles.featureDescription}>
                Choose your preferred payment method for faster transactions.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#f0fdf4' }]}>
              <Check size={24} color="#10b981" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Easy Management</Text>
              <Text style={styles.featureDescription}>
                Add, edit, or remove payment methods with just a few taps.
              </Text>
            </View>
          </View>
        </View>



        {/* Contact Support */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Have Payment Questions?</Text>
          <Text style={styles.supportText}>
            If you have questions about payments, billing, or need assistance, our support team is here to help.
          </Text>
          <Pressable 
            style={styles.supportButton}
            onPress={() => router.push('/help-support')}
          >
            <Text style={styles.supportButtonText}>Get Support</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  comingSoonSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  comingSoonIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  securitySection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  securityText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 20,
  },
  securityList: {
    gap: 12,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityItemText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  featuresSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  paymentTypesSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentTypesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  paymentTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paymentTypeCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  paymentTypeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#bd84f6',
  },
  paymentTypeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  supportSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  supportText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  supportButton: {
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bd84f6',
  },
  supportButtonText: {
    color: '#bd84f6',
    fontSize: 15,
    fontWeight: '600',
  },
});