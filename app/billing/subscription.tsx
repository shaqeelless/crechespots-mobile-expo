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
  Crown,
  Check,
  X,
  Star,
  Zap,
  Sparkles,
  Calendar,
  CreditCard,
  Shield,
  Download,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

interface CurrentSubscription {
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const { profile } = useAuth();

  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Basic features for getting started',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: [
        'Up to 2 children',
        'Basic progress tracking',
        'Standard support',
        'Community access',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Perfect for growing families',
      price: 9.99,
      currency: 'USD',
      interval: 'month',
      features: [
        'Up to 5 children',
        'Advanced progress tracking',
        'Priority support',
        'Customizable profiles',
        'Medical records storage',
        'Progress analytics',
      ],
      popular: true,
    },
    {
      id: 'family',
      name: 'Family',
      description: 'Everything for your entire family',
      price: 19.99,
      currency: 'USD',
      interval: 'month',
      features: [
        'Unlimited children',
        'All Premium features',
        '24/7 premium support',
        'Family sharing',
        'Advanced analytics',
        'Custom reports',
        'Early access to features',
      ],
    },
  ];

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual subscription data
      const mockSubscription: CurrentSubscription = {
        plan_id: 'premium',
        status: 'active',
        current_period_end: '2024-12-31T23:59:59Z',
        cancel_at_period_end: false,
      };

      setCurrentSubscription(mockSubscription);
      setSelectedPlan(mockSubscription.plan_id);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!profile) {
      Alert.alert('Error', 'You must be logged in to subscribe');
      return;
    }

    try {
      setProcessing(true);
      
      // Simulate subscription process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success!',
        `You have successfully subscribed to the ${subscriptionPlans.find(p => p.id === planId)?.name} plan.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error subscribing:', error);
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              // Simulate cancellation
              await new Promise(resolve => setTimeout(resolve, 1500));
              setCurrentSubscription(null);
              setSelectedPlan('free');
              Alert.alert('Success', 'Your subscription has been canceled.');
            } catch (error) {
              console.error('Error canceling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription.');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Star size={20} color="#6b7280" />;
      case 'premium':
        return <Crown size={20} color="#f59e0b" />;
      case 'family':
        return <Sparkles size={20} color="#8b5cf6" />;
      default:
        return <Star size={20} color="#6b7280" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <Text style={styles.headerTitle}>Subscription</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#bd84f6" />
          <Text style={styles.loadingText}>Loading subscription...</Text>
        </View>
      </View>
    );
  }

  const currentPlan = subscriptionPlans.find(p => p.id === currentSubscription?.plan_id);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Current Subscription */}
        {currentSubscription && currentPlan && (
          <View style={styles.currentSubscription}>
            <View style={styles.currentSubscriptionHeader}>
              <View style={styles.planIcon}>
                {getPlanIcon(currentPlan.id)}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.currentPlanName}>{currentPlan.name} Plan</Text>
                <Text style={styles.currentPlanStatus}>
                  Status: <Text style={styles.statusActive}>Active</Text>
                </Text>
                <Text style={styles.renewalDate}>
                  Renews on {formatDate(currentSubscription.current_period_end)}
                </Text>
              </View>
            </View>
            
            {currentSubscription.cancel_at_period_end && (
              <View style={styles.cancellationNotice}>
                <Text style={styles.cancellationText}>
                  Your subscription will cancel on {formatDate(currentSubscription.current_period_end)}
                </Text>
              </View>
            )}

            <View style={styles.currentSubscriptionActions}>
              <Pressable style={styles.downloadInvoiceButton}>
                <Download size={16} color="#374151" />
                <Text style={styles.downloadInvoiceText}>Download Invoice</Text>
              </Pressable>
              
              <Pressable 
                style={styles.cancelSubscriptionButton}
                onPress={handleCancelSubscription}
                disabled={processing}
              >
                <Text style={styles.cancelSubscriptionText}>
                  {processing ? 'Processing...' : 'Cancel Subscription'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Available Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {currentSubscription ? 'Change Plan' : 'Choose Your Plan'}
          </Text>
          <Text style={styles.sectionDescription}>
            Select the plan that works best for your family's needs
          </Text>

          <View style={styles.plansGrid}>
            {subscriptionPlans.map((plan) => (
              <View 
                key={plan.id} 
                style={[
                  styles.planCard,
                  plan.popular && styles.popularPlanCard,
                  selectedPlan === plan.id && styles.selectedPlanCard,
                ]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Crown size={12} color="#ffffff" />
                    <Text style={styles.popularBadgeText}>Most Popular</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View style={styles.planIcon}>
                    {getPlanIcon(plan.id)}
                  </View>
                  <View style={styles.planTitle}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>
                </View>

                <View style={styles.planPrice}>
                  <Text style={styles.price}>
                    ${plan.price}
                    <Text style={styles.pricePeriod}>/{plan.interval}</Text>
                  </Text>
                </View>

                <View style={styles.planFeatures}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Check size={16} color="#10b981" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  style={[
                    styles.subscribeButton,
                    selectedPlan === plan.id && styles.currentPlanButton,
                    processing && styles.disabledButton,
                  ]}
                  onPress={() => handleSubscribe(plan.id)}
                  disabled={processing || selectedPlan === plan.id}
                >
                  {processing && selectedPlan === plan.id ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.subscribeButtonText}>
                      {selectedPlan === plan.id ? 'Current Plan' : 'Subscribe'}
                    </Text>
                  )}
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Billing Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Information</Text>
          
          <View style={styles.billingInfo}>
            <View style={styles.billingItem}>
              <CreditCard size={16} color="#6b7280" />
              <Text style={styles.billingLabel}>Payment Method</Text>
              <Text style={styles.billingValue}>Visa •••• 4242</Text>
            </View>
            
            <View style={styles.billingItem}>
              <Calendar size={16} color="#6b7280" />
              <Text style={styles.billingLabel}>Billing Cycle</Text>
              <Text style={styles.billingValue}>Monthly</Text>
            </View>
            
            <View style={styles.billingItem}>
              <Shield size={16} color="#6b7280" />
              <Text style={styles.billingLabel}>Security</Text>
              <Text style={styles.billingValue}>PCI Compliant</Text>
            </View>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqList}>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can I change my plan anytime?</Text>
              <Text style={styles.faqAnswer}>
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Is there a free trial?</Text>
              <Text style={styles.faqAnswer}>
                We offer a 14-day free trial for all paid plans. No credit card required to start.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What's your refund policy?</Text>
              <Text style={styles.faqAnswer}>
                We offer a 30-day money-back guarantee for all annual subscriptions.
              </Text>
            </View>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 20,
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
  currentSubscription: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#bd84f6',
  },
  currentSubscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  currentPlanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  currentPlanStatus: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  statusActive: {
    color: '#10b981',
    fontWeight: '600',
  },
  renewalDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  cancellationNotice: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  cancellationText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
  currentSubscriptionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downloadInvoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  downloadInvoiceText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  cancelSubscriptionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
  },
  cancelSubscriptionText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  plansGrid: {
    gap: 16,
  },
  planCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  popularPlanCard: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  selectedPlanCard: {
    borderColor: '#bd84f6',
    backgroundColor: '#fdf2f8',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -60 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planTitle: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  planPrice: {
    marginBottom: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#374151',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'normal',
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  subscribeButton: {
    backgroundColor: '#bd84f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: '#10b981',
  },
  disabledButton: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  billingInfo: {
    gap: 12,
  },
  billingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  billingLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  billingValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  faqList: {
    gap: 16,
  },
  faqItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});