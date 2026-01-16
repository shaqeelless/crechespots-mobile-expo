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
  Download,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Construction,
  Calendar,
  CreditCard,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface BillingHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  invoice_number: string;
  payment_method: string;
  created_at: string;
  due_date?: string;
}

export default function BillingHistoryScreen() {
  const router = useRouter();
  const { profile } = useAuth();

  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  useEffect(() => {
    // Simulate loading for a better UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color="#10b981" />;
      case 'pending':
        return <Clock size={16} color="#f59e0b" />;
      case 'failed':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <Clock size={16} color="#6b7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <Text style={styles.headerTitle}>Billing History</Text>
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
        <Text style={styles.headerTitle}>Billing History</Text>
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
            The billing history feature is currently under development. We're working hard to bring you a comprehensive view of all your transactions and invoices.
          </Text>
        </View>

        {/* Information Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <View style={[styles.infoCardIcon, { backgroundColor: '#eef2ff' }]}>
              <Calendar size={24} color="#4f46e5" />
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Automatic Tracking</Text>
              <Text style={styles.infoCardDescription}>
                All your transactions will be automatically tracked and categorized.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={[styles.infoCardIcon, { backgroundColor: '#f0f9ff' }]}>
              <Download size={24} color="#0ea5e9" />
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Invoice Downloads</Text>
              <Text style={styles.infoCardDescription}>
                Download detailed invoices for all your payments and subscriptions.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={[styles.infoCardIcon, { backgroundColor: '#fdf2f8' }]}>
              <CreditCard size={24} color="#db2777" />
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Payment Methods</Text>
              <Text style={styles.infoCardDescription}>
                View and manage all your saved payment methods in one place.
              </Text>
            </View>
          </View>
        </View>

        {/* What to Expect Section */}
        <View style={styles.expectationsSection}>
          <Text style={styles.expectationsTitle}>What to Expect</Text>
          
          <View style={styles.expectationItem}>
            <View style={styles.expectationBullet}>
              <Text style={styles.expectationBulletText}>•</Text>
            </View>
            <View style={styles.expectationContent}>
              <Text style={styles.expectationItemTitle}>Complete Transaction History</Text>
              <Text style={styles.expectationItemText}>
                View all your payments, refunds, and subscription charges in chronological order.
              </Text>
            </View>
          </View>

          <View style={styles.expectationItem}>
            <View style={styles.expectationBullet}>
              <Text style={styles.expectationBulletText}>•</Text>
            </View>
            <View style={styles.expectationContent}>
              <Text style={styles.expectationItemTitle}>Filter & Search</Text>
              <Text style={styles.expectationItemText}>
                Easily find specific transactions by date, amount, or status.
              </Text>
            </View>
          </View>

          <View style={styles.expectationItem}>
            <View style={styles.expectationBullet}>
              <Text style={styles.expectationBulletText}>•</Text>
            </View>
            <View style={styles.expectationContent}>
              <Text style={styles.expectationItemTitle}>Export Options</Text>
              <Text style={styles.expectationItemText}>
                Export your billing history for accounting or record-keeping purposes.
              </Text>
            </View>
          </View>

          <View style={styles.expectationItem}>
            <View style={styles.expectationBullet}>
              <Text style={styles.expectationBulletText}>•</Text>
            </View>
            <View style={styles.expectationContent}>
              <Text style={styles.expectationItemTitle}>Receipt Management</Text>
              <Text style={styles.expectationItemText}>
                Access and download receipts for all your successful payments.
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Need Help with Billing?</Text>
          <Text style={styles.supportText}>
            If you have questions about a recent payment or need billing assistance, our support team is here to help.
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
  infoCards: {
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  infoCardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  expectationsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  expectationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
  },
  expectationItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  expectationBullet: {
    width: 24,
    alignItems: 'center',
  },
  expectationBulletText: {
    fontSize: 20,
    color: '#bd84f6',
    fontWeight: 'bold',
  },
  expectationContent: {
    flex: 1,
  },
  expectationItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  expectationItemText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
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