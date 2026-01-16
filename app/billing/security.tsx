import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Bell,
  Construction,
  CheckCircle,
  Key,
  Users,
  Globe,
} from 'lucide-react-native';

export default function SecurityScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Security & Privacy</Text>
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
            Enhanced Security Features Coming Soon
          </Text>
          <Text style={styles.comingSoonText}>
            We're developing comprehensive security and privacy features to give you complete control over your account safety and data protection.
          </Text>
        </View>

        {/* Security Overview */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewHeader}>
            <Shield size={24} color="#10b981" />
            <Text style={styles.overviewTitle}>Your Security Status</Text>
          </View>
          
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIcon, { backgroundColor: '#f0fdf4' }]}>
                <CheckCircle size={20} color="#10b981" />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>Basic Protection Active</Text>
                <Text style={styles.statusText}>
                  Your account is protected with standard security measures
                </Text>
              </View>
            </View>
            
            <View style={styles.statusItem}>
              <View style={[styles.statusIcon, { backgroundColor: '#fffbeb' }]}>
                <Key size={20} color="#f59e0b" />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>Enhanced Features Coming</Text>
                <Text style={styles.statusText}>
                  Additional security options will be available soon
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Coming Features */}

        {/* Security Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Security Best Practices</Text>
          
          <View style={styles.tipItem}>
            <View style={styles.tipBullet}>
              <Text style={styles.tipBulletText}>1</Text>
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Use a Strong Password</Text>
              <Text style={styles.tipItemText}>
                Create a unique password with letters, numbers, and symbols
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <View style={styles.tipBullet}>
              <Text style={styles.tipBulletText}>2</Text>
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Don't Share Credentials</Text>
              <Text style={styles.tipItemText}>
                Never share your password or verification codes with anyone
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <View style={styles.tipBullet}>
              <Text style={styles.tipBulletText}>3</Text>
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Log Out from Shared Devices</Text>
              <Text style={styles.tipItemText}>
                Always sign out when using public or shared computers
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <View style={styles.tipBullet}>
              <Text style={styles.tipBulletText}>4</Text>
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Keep Software Updated</Text>
              <Text style={styles.tipItemText}>
                Regularly update your app and device software for security patches
              </Text>
            </View>
          </View>
        </View>


        {/* Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.resourcesTitle}>Security Resources</Text>
          
          <Pressable 
            style={styles.resourceButton}
            onPress={() => router.push('/help-support')}
          >
            <View style={[styles.resourceIcon, { backgroundColor: '#f0fdf4' }]}>
              <Shield size={20} color="#10b981" />
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Security Help Center</Text>
              <Text style={styles.resourceText}>
                Learn about account security and best practices
              </Text>
            </View>
          </Pressable>
          
          <Pressable 
            style={styles.resourceButton}
            onPress={() => router.push('/privacy-policies')}
          >
            <View style={[styles.resourceIcon, { backgroundColor: '#eef2ff' }]}>
              <Globe size={20} color="#4f46e5" />
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Privacy Policy</Text>
              <Text style={styles.resourceText}>
                Read our complete privacy and data protection policy
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Contact Support */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Need Help with Security?</Text>
          <Text style={styles.supportText}>
            If you have security concerns or notice any suspicious activity, please contact our support team immediately.
          </Text>
          <Pressable 
            style={styles.supportButton}
            onPress={() => router.push('/help-support')}
          >
            <Text style={styles.supportButtonText}>Contact Security Support</Text>
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
  overviewSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  statusCard: {
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
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
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 40,
  },
  featureCardText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  tipsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipBulletText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#bd84f6',
  },
  tipContent: {
    flex: 1,
  },
  tipItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  tipItemText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  currentSettingsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  currentSettingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
  },
  settingCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingDetails: {
    flex: 1,
  },
  settingName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  resourcesSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  resourceText: {
    fontSize: 12,
    color: '#6b7280',
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