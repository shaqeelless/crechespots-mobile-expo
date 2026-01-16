import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  HelpCircle,
  FileText,
  Users,
  Search,
  ChevronRight,
  ExternalLink,
  Clock,
} from 'lucide-react-native';

const FAQItem = ({ question, answer, isOpen, onPress }: any) => (
  <View style={styles.faqItem}>
    <Pressable style={styles.faqQuestion} onPress={onPress}>
      <Text style={styles.faqQuestionText}>{question}</Text>
      <ChevronRight 
        size={20} 
        color="#6b7280" 
        style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
      />
    </Pressable>
    {isOpen && (
      <View style={styles.faqAnswer}>
        <Text style={styles.faqAnswerText}>{answer}</Text>
      </View>
    )}
  </View>
);

export default function HelpSupportScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I apply to a creche?",
      answer: "To apply to a creche, browse through the available creches in your area, select one that fits your needs, and click the 'Apply Now' button. You'll need to provide your child's information and any required documents."
    },
    {
      question: "What documents do I need for application?",
      answer: "Typically, you'll need your child's birth certificate, immunization records, and your ID document. Some creches may require additional documents like proof of address or medical aid information."
    },
    {
      question: "How long does the application process take?",
      answer: "The application process usually takes 2-5 business days. Creches will review your application and contact you directly for any follow-up or to schedule a visit."
    },
    {
      question: "Can I apply to multiple creches?",
      answer: "Yes, you can apply to multiple creches simultaneously. This increases your chances of finding a suitable spot for your child."
    },
    {
      question: "How do I know if my application was successful?",
      answer: "You'll receive a notification in the app and via email when a creche reviews your application. The creche will contact you directly to discuss next steps."
    }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Support",
      action: () => Linking.openURL('tel:+27111234567'),
      color: '#10b981'
    },
    {
      icon: Mail,
      title: "Email Support",
      action: () => Linking.openURL('mailto:support@crechespots.co.za'),
      color: '#3b82f6'
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      action: () => Alert.alert('Live Chat', 'Live chat feature coming soon!'),
      color: '#8b5cf6'
    }
  ];

  const resources = [
    {
      icon: FileText,
      title: "Application Guide",
      description: "Step-by-step guide to applying to creches",
      action: () => Alert.alert('Guide', 'PDF guide would open here')
    },
    {
      icon: Users,
      title: "Parent Community",
      description: "Connect with other parents using CrecheSpots",
      action: () => Alert.alert('Community', 'Community forum would open here')
    },
    {
      icon: HelpCircle,
      title: "FAQ Section",
      description: "Browse frequently asked questions",
      action: () => setOpenFaq(0)
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help Quickly</Text>
          <Text style={styles.sectionSubtitle}>
            Choose your preferred way to contact us
          </Text>
          
          <View style={styles.contactGrid}>
            {contactMethods.map((method, index) => (
              <Pressable
                key={index}
                style={styles.contactCard}
                onPress={method.action}
              >
                <View style={[styles.contactIcon, { backgroundColor: method.color }]}>
                  <method.icon size={24} color="#ffffff" />
                </View>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactDescription}>{method.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Helpful Resources</Text>
          <View style={styles.resourcesList}>
            {resources.map((resource, index) => (
              <Pressable
                key={index}
                style={styles.resourceItem}
                onPress={resource.action}
              >
                <View style={styles.resourceIcon}>
                  <resource.icon size={20} color="#bd84f6" />
                </View>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>{resource.title}</Text>
                  <Text style={styles.resourceDescription}>{resource.description}</Text>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {filteredFaqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaq === index}
                onPress={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </View>
        </View>

        {/* Support Hours */}
        <View style={styles.supportHours}>
          <View style={styles.supportHoursHeader}>
            <Clock size={20} color="#6b7280" />
            <Text style={styles.supportHoursTitle}>Support Hours</Text>
          </View>
          <View style={styles.supportHoursContent}>
            <Text style={styles.supportHoursText}>
              <Text style={styles.supportHoursDay}>Monday - Friday:</Text> 8:00 AM - 6:00 PM
            </Text>
            <Text style={styles.supportHoursText}>
              <Text style={styles.supportHoursDay}>Saturday:</Text> 9:00 AM - 1:00 PM
            </Text>
            <Text style={styles.supportHoursText}>
              <Text style={styles.supportHoursDay}>Sunday:</Text> Closed
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
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  resourcesList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  faqList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginRight: 12,
  },
  faqAnswer: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: '#fafafa',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  supportHours: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  supportHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  supportHoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  supportHoursContent: {
    gap: 8,
  },
  supportHoursText: {
    fontSize: 14,
    color: '#6b7280',
  },
  supportHoursDay: {
    fontWeight: '500',
    color: '#374151',
  },
});