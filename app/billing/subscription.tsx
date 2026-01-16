import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Crown,
  Check,
  Star,
  Zap,
  Sparkles,
  Calendar,
  CreditCard,
  Shield,
  Construction,
  TrendingUp,
  Users,
  Target,
  Gift,
} from 'lucide-react-native';

export default function SubscriptionScreen() {
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
          <Text style={styles.headerTitle}>Subscriptions</Text>
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
        <Text style={styles.headerTitle}>Subscriptions</Text>
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
            Subscription Plans Coming Soon
          </Text>
          <Text style={styles.comingSoonText}>
            We're developing flexible subscription options to enhance your experience. Premium features and exclusive benefits will be available soon.
          </Text>
        </View>


        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>What You'll Get</Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitNumber}>
                <Text style={styles.benefitNumberText}>01</Text>
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitItemTitle}>Flexible Billing</Text>
                <Text style={styles.benefitItemText}>
                  Choose between monthly or annual billing cycles to suit your budget
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitNumber}>
                <Text style={styles.benefitNumberText}>02</Text>
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitItemTitle}>Easy Management</Text>
                <Text style={styles.benefitItemText}>
                  Upgrade, downgrade, or cancel your subscription anytime
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitNumber}>
                <Text style={styles.benefitNumberText}>03</Text>
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitItemTitle}>Secure Payments</Text>
                <Text style={styles.benefitItemText}>
                  All transactions are encrypted and protected by industry standards
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitNumber}>
                <Text style={styles.benefitNumberText}>04</Text>
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitItemTitle}>Family Plans</Text>
                <Text style={styles.benefitItemText}>
                  Share benefits with family members for added convenience
                </Text>
              </View>
            </View>
          </View>
        </View>


        {/* Support */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Have Questions?</Text>
          <Text style={styles.supportText}>
            Our team is here to help with any questions about future subscription plans or our services.
          </Text>
          <Pressable 
            style={styles.supportButton}
            onPress={() => router.push('/help-support')}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
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
    marginBottom: 24,
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
  valueSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  valueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  valueCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  valueIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  valueCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 40,
  },
  valueCardText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  plansPreviewSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  plansPreviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  planTiers: {
    gap: 16,
  },
  planTier: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  tierFeatures: {
    marginBottom: 16,
  },
  tierFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tierFeatureText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  tierPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bd84f6',
    textAlign: 'center',
  },
  benefitsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  benefitNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#bd84f6',
  },
  benefitContent: {
    flex: 1,
  },
  benefitItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  benefitItemText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  updateSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  updateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  updateText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  updateOptions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  notifyButton: {
    flex: 1,
    backgroundColor: '#bd84f6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  notifyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  learnMoreButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  learnMoreButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
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