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
    fetchBillingHistory();
  }, []);

  const fetchBillingHistory = async () => {
    try {
      setLoading(true);
      
      // This would typically come from your billing/invoice table
      // For now, we'll use mock data
      const mockData: BillingHistory[] = [
        {
          id: '1',
          amount: 29.99,
          currency: 'USD',
          status: 'completed',
          description: 'Monthly Subscription - Premium Plan',
          invoice_number: 'INV-2024-001',
          payment_method: 'Visa •••• 4242',
          created_at: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          amount: 29.99,
          currency: 'USD',
          status: 'completed',
          description: 'Monthly Subscription - Premium Plan',
          invoice_number: 'INV-2023-012',
          payment_method: 'Visa •••• 4242',
          created_at: '2023-12-15T10:30:00Z',
        },
        {
          id: '3',
          amount: 49.99,
          currency: 'USD',
          status: 'completed',
          description: 'One-time Setup Fee',
          invoice_number: 'INV-2023-011',
          payment_method: 'Visa •••• 4242',
          created_at: '2023-11-20T14:45:00Z',
        },
        {
          id: '4',
          amount: 29.99,
          currency: 'USD',
          status: 'pending',
          description: 'Monthly Subscription - Premium Plan',
          invoice_number: 'INV-2024-002',
          payment_method: 'Visa •••• 4242',
          created_at: '2024-01-20T09:15:00Z',
          due_date: '2024-02-15T00:00:00Z',
        },
        {
          id: '5',
          amount: 29.99,
          currency: 'USD',
          status: 'failed',
          description: 'Monthly Subscription - Premium Plan',
          invoice_number: 'INV-2023-010',
          payment_method: 'Visa •••• 4242',
          created_at: '2023-10-15T10:30:00Z',
        },
      ];

      setBillingHistory(mockData);
    } catch (error) {
      console.error('Error fetching billing history:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredHistory = billingHistory.filter(item => 
    filter === 'all' || item.status === filter
  );

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
          <ActivityIndicator size="large" color="#bd4ab5" />
          <Text style={styles.loadingText}>Loading billing history...</Text>
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

      <ScrollView style={styles.content}>
        {/* Filter Tabs */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Filter by status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterTabs}>
              {[
                { key: 'all', label: 'All' },
                { key: 'completed', label: 'Completed' },
                { key: 'pending', label: 'Pending' },
                { key: 'failed', label: 'Failed' },
              ].map((tab) => (
                <Pressable
                  key={tab.key}
                  style={[
                    styles.filterTab,
                    filter === tab.key && styles.activeFilterTab,
                  ]}
                  onPress={() => setFilter(tab.key as any)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      filter === tab.key && styles.activeFilterTabText,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Billing History List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          
          {filteredHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Receipt size={48} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>No transactions found</Text>
              <Text style={styles.emptyStateText}>
                {filter === 'all' 
                  ? "You don't have any transactions yet."
                  : `No ${filter} transactions found.`
                }
              </Text>
            </View>
          ) : (
            filteredHistory.map((item) => (
              <View key={item.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>
                      {item.description}
                    </Text>
                    <Text style={styles.transactionInvoice}>
                      {item.invoice_number}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(item.created_at)}
                    </Text>
                    <Text style={styles.transactionMethod}>
                      {item.payment_method}
                    </Text>
                  </View>
                  
                  <View style={styles.transactionAmount}>
                    <Text style={styles.amountText}>
                      {formatCurrency(item.amount, item.currency)}
                    </Text>
                    <View style={styles.statusContainer}>
                      {getStatusIcon(item.status)}
                      <Text 
                        style={[
                          styles.statusText,
                          { color: getStatusColor(item.status) }
                        ]}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.transactionActions}>
                  <Pressable style={styles.downloadButton}>
                    <Download size={16} color="#374151" />
                    <Text style={styles.downloadText}>Download Invoice</Text>
                  </Pressable>
                  
                  {item.status === 'pending' && item.due_date && (
                    <View style={styles.dueDateContainer}>
                      <Clock size={14} color="#f59e0b" />
                      <Text style={styles.dueDateText}>
                        Due {formatDate(item.due_date)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {billingHistory.filter(item => item.status === 'completed').length}
              </Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {billingHistory.filter(item => item.status === 'pending').length}
              </Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {billingHistory.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
              </Text>
              <Text style={styles.summaryLabel}>Total Spent</Text>
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
  filterSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterTab: {
    backgroundColor: '#fdf2f8',
    borderColor: '#bd4ab5',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#bd4ab5',
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
    marginBottom: 16,
  },
  transactionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  transactionInvoice: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  transactionMethod: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  downloadText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fffbeb',
    borderRadius: 6,
  },
  dueDateText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  summarySection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bd4ab5',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});