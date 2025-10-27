import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
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
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface PaymentMethod {
  id: string;
  card_type: string;
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string;
  is_default: boolean;
  created_at: string;
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { profile } = useAuth();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', profile?.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
    };

    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean || cardNumberClean.length !== 16 || !/^\d+$/.test(cardNumberClean)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Please enter expiry date in MM/YY format';
    }

    if (!formData.cvv || formData.cvv.length < 3 || formData.cvv.length > 4 || !/^\d+$/.test(formData.cvv)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter cardholder name';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '').replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const getCardType = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'American Express';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'Discover';
    
    return 'Credit Card';
  };

  const handleAddPaymentMethod = async () => {
    if (!validateForm()) return;

    try {
      setProcessing(true);

      const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
      const cardType = getCardType(cardNumberClean);
      const lastFour = cardNumberClean.slice(-4);

      const [expiryMonth, expiryYear] = formData.expiryDate.split('/');
      const fullYear = 2000 + parseInt(expiryYear, 10);

      if (formData.isDefault) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', profile?.id)
          .eq('is_default', true);
      }

      const { error } = await supabase
        .from('payment_methods')
        .insert([
          {
            user_id: profile?.id,
            card_type: cardType,
            last_four: lastFour,
            expiry_month: parseInt(expiryMonth, 10),
            expiry_year: fullYear,
            cardholder_name: formData.cardholderName.trim(),
            is_default: formData.isDefault || paymentMethods.length === 0,
          },
        ]);

      if (error) throw error;

      Alert.alert('Success', 'Payment method added successfully');
      setShowAddModal(false);
      resetForm();
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add payment method. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      setProcessing(true);

      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', profile?.id);

      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', methodId)
        .eq('user_id', profile?.id);

      if (error) throw error;

      Alert.alert('Success', 'Default payment method updated');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to update default payment method');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    const method = paymentMethods.find(pm => pm.id === methodId);
    
    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete your ${method?.card_type} card ending in ${method?.last_four}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('payment_methods')
                .delete()
                .eq('id', methodId);

              if (error) throw error;

              Alert.alert('Success', 'Payment method deleted successfully');
              fetchPaymentMethods();
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      isDefault: false,
    });
    setErrors({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
    });
  };

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
          <Text style={styles.loadingText}>Loading payment methods...</Text>
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

      <ScrollView style={styles.content}>
        {/* Add New Card Button */}
        <Pressable 
          style={styles.addCardButton}
          onPress={() => setShowAddModal(true)}
        >
          <View style={styles.addCardContent}>
            <Plus size={24} color="#bd84f6" />
            <Text style={styles.addCardText}>Add New Card</Text>
          </View>
        </Pressable>

        {/* Payment Methods List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>
          
          {paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <CreditCard size={48} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>No payment methods</Text>
              <Text style={styles.emptyStateText}>
                Add a payment method to get started with payments and subscriptions.
              </Text>
            </View>
          ) : (
            paymentMethods.map((method) => (
              <View key={method.id} style={styles.paymentCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardIcon}>
                      <CreditCard size={20} color="#bd84f6" />
                    </View>
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardType}>{method.card_type}</Text>
                      <Text style={styles.cardNumber}>
                        •••• {method.last_four}
                      </Text>
                      <Text style={styles.cardExpiry}>
                        Expires {method.expiry_month.toString().padStart(2, '0')}/{method.expiry_year.toString().slice(-2)}
                      </Text>
                      <Text style={styles.cardholderName}>
                        {method.cardholder_name}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.cardActions}>
                    {method.is_default ? (
                      <View style={styles.defaultBadge}>
                        <Check size={12} color="#ffffff" />
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    ) : (
                      <Pressable 
                        style={styles.setDefaultButton}
                        onPress={() => handleSetDefault(method.id)}
                        disabled={processing}
                      >
                        <Text style={styles.setDefaultText}>Set Default</Text>
                      </Pressable>
                    )}
                    
                    <Pressable 
                      style={styles.deleteButton}
                      onPress={() => handleDeletePaymentMethod(method.id)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Security Notice */}
        <View style={styles.securitySection}>
          <Lock size={16} color="#10b981" />
          <Text style={styles.securityText}>
            Your payment information is secure and encrypted. We never store your full card details.
          </Text>
        </View>
      </ScrollView>

      {/* Add Payment Method Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Payment Method</Text>
            <Pressable 
              style={styles.closeButton}
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              <X size={24} color="#374151" />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={[styles.inputContainer, errors.cardNumber && styles.inputError]}>
                <CreditCard size={20} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChangeText={(text) => setFormData({ ...formData, cardNumber: formatCardNumber(text) })}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
              {errors.cardNumber ? <Text style={styles.errorText}>{errors.cardNumber}</Text> : null}
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <View style={[styles.inputContainer, errors.expiryDate && styles.inputError]}>
                  <Calendar size={20} color="#9ca3af" />
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChangeText={(text) => setFormData({ ...formData, expiryDate: formatExpiryDate(text) })}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                {errors.expiryDate ? <Text style={styles.errorText}>{errors.expiryDate}</Text> : null}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <View style={[styles.inputContainer, errors.cvv && styles.inputError]}>
                  <Lock size={20} color="#9ca3af" />
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    value={formData.cvv}
                    onChangeText={(text) => setFormData({ ...formData, cvv: text.replace(/\D/g, '').substring(0, 4) })}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
                {errors.cvv ? <Text style={styles.errorText}>{errors.cvv}</Text> : null}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <View style={[styles.inputContainer, errors.cardholderName && styles.inputError]}>
                <User size={20} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={formData.cardholderName}
                  onChangeText={(text) => setFormData({ ...formData, cardholderName: text })}
                  autoCapitalize="words"
                />
              </View>
              {errors.cardholderName ? <Text style={styles.errorText}>{errors.cardholderName}</Text> : null}
            </View>

            <Pressable
              style={styles.checkboxContainer}
              onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
            >
              <View style={[styles.checkbox, formData.isDefault && styles.checkboxChecked]}>
                {formData.isDefault && <Check size={14} color="#ffffff" />}
              </View>
              <Text style={styles.checkboxLabel}>Set as default payment method</Text>
            </Pressable>

            <View style={styles.modalSecuritySection}>
              <Lock size={14} color="#10b981" />
              <Text style={styles.modalSecurityText}>
                Your card details are secure and encrypted. We use industry-standard security measures.
              </Text>
            </View>

            <Pressable
              style={[styles.addButton, processing && styles.disabledButton]}
              onPress={handleAddPaymentMethod}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Plus size={20} color="#ffffff" />
              )}
              <Text style={styles.addButtonText}>
                {processing ? 'Adding Card...' : 'Add Payment Method'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
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
  addCardButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#bd84f6',
    borderStyle: 'dashed',
  },
  addCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  addCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#bd84f6',
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
  paymentCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  cardholderName: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  cardActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  setDefaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  setDefaultText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 6,
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
  securitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f4fcfe',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  inputRow: {
    flexDirection: 'row',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#bd84f6',
    borderColor: '#bd84f6',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  modalSecuritySection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  modalSecurityText: {
    flex: 1,
    fontSize: 12,
    color: '#065f46',
    lineHeight: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#bd84f6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  disabledButton: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});