import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  FileText,
  Search,
  Send,
  ExternalLink,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function SupportScreen() {
  const router = useRouter();
  const { profile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('billing');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  const supportCategories = [
    {
      id: 'billing',
      title: 'Billing & Payments',
      description: 'Questions about charges, refunds, and payment methods',
      icon: FileText,
      color: '#bd84f6',
    },
    {
      id: 'account',
      title: 'Account & Security',
      description: 'Login issues, password reset, and security concerns',
      icon: HelpCircle,
      color: '#10b981',
    },
    {
      id: 'features',
      title: 'Features & Usage',
      description: 'How to use features and troubleshoot problems',
      icon: MessageCircle,
      color: '#f59e0b',
    },
    {
      id: 'technical',
      title: 'Technical Support',
      description: 'App issues, bugs, and technical problems',
      icon: Phone,
      color: '#ef4444',
    },
  ];

  const faqItems = [
    {
      question: 'How do I update my payment method?',
      answer: 'Go to Billing → Payment Methods to add, update, or remove your payment methods.',
      category: 'billing',
    },
    {
      question: 'Can I get a refund?',
      answer: 'We offer a 30-day money-back guarantee for annual subscriptions. Contact support for assistance.',
      category: 'billing',
    },
    {
      question: 'How do I reset my password?',
      answer: 'Go to Settings → Security → Change Password to reset your password via email.',
      category: 'account',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption and security measures to protect your data.',
      category: 'account',
    },
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      availability: 'Available now',
      action: () => handleLiveChat(),
      color: '#10b981',
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us an email',
      availability: 'Response within 24 hours',
      action: () => handleEmailSupport(),
      color: '#3b82f6',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call our support line',
      availability: 'Mon-Fri, 9AM-5PM EST',
      action: () => handlePhoneSupport(),
      color: '#bd84f6',
    },
  ];

  const filteredFaqs = faqItems.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  );

  const handleLiveChat = () => {
    Alert.alert(
      'Live Chat',
      'Our live chat support is available 24/7. A support agent will be with you shortly.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Chat', onPress: () => setLoading(true) },
      ]
    );
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@yourapp.com?subject=Support Request');
  };

  const handlePhoneSupport = () => {
    Linking.openURL('tel:+1-555-0123');
  };

  const handleSubmitSupportRequest = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate support request submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Support Request Sent',
        'We have received your support request and will get back to you within 24 hours.',
        [{ text: 'OK' }]
      );
      
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error submitting support request:', error);
      Alert.alert('Error', 'Failed to submit support request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIcon}>
            <HelpCircle size={32} color="#bd84f6" />
          </View>
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeDescription}>
            Get answers to your questions and find solutions to any issues you're experiencing.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search help articles..."
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Support Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Categories</Text>
          
          <View style={styles.categoriesGrid}>
            {supportCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    { borderColor: category.color },
                    activeCategory === category.id && styles.activeCategoryCard,
                  ]}
                  onPress={() => setActiveCategory(category.id)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                    <IconComponent size={24} color={category.color} />
                  </View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {filteredFaqs.map((faq, index) => (
            <Pressable key={index} style={styles.faqItem}>
              <View style={styles.faqContent}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
              <ExternalLink size={16} color="#6b7280" />
            </Pressable>
          ))}
        </View>

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <View style={styles.contactGrid}>
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <Pressable
                  key={index}
                  style={styles.contactCard}
                  onPress={method.action}
                >
                  <View style={[styles.contactIcon, { backgroundColor: `${method.color}15` }]}>
                    <IconComponent size={24} color={method.color} />
                  </View>
                  <Text style={styles.contactTitle}>{method.title}</Text>
                  <Text style={styles.contactDescription}>{method.description}</Text>
                  <View style={styles.availability}>
                    <Clock size={12} color="#10b981" />
                    <Text style={styles.availabilityText}>{method.availability}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Support Request Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          <Text style={styles.sectionDescription}>
            Can't find what you're looking for? Send us a detailed message and we'll help you out.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="Brief description of your issue"
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Please describe your issue in detail..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <Pressable
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmitSupportRequest}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Send size={20} color="#ffffff" />
              )}
              <Text style={styles.submitButtonText}>
                {loading ? 'Sending...' : 'Send Message'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Support Hours */}
        <View style={styles.hoursSection}>
          <Clock size={20} color="#6b7280" />
          <View style={styles.hoursInfo}>
            <Text style={styles.hoursTitle}>Support Hours</Text>
            <Text style={styles.hoursText}>
              Live Chat: 24/7{'\n'}
              Email: 24/7 (response within 24 hours){'\n'}
              Phone: Mon-Fri, 9AM-5PM EST
            </Text>
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
  welcomeSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
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
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  activeCategoryCard: {
    backgroundColor: '#fdf2f8',
    borderColor: '#bd84f6',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  faqContent: {
    flex: 1,
    marginRight: 12,
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
  contactGrid: {
    gap: 12,
  },
  contactCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availabilityText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#bd84f6',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  hoursSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  hoursInfo: {
    flex: 1,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  hoursText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});