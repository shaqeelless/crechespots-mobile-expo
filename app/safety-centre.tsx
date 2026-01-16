import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  Bell,
  Users,
  MapPin,
  FileText,
  ChevronRight,
  CheckCircle,
} from 'lucide-react-native';

const SafetyFeature = ({ icon: Icon, title, description, action, actionText, color }: any) => (
  <View style={styles.safetyFeature}>
    <View style={[styles.featureIcon, { backgroundColor: color }]}>
      <Icon size={24} color="#ffffff" />
    </View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
    {action && (
      <Pressable style={styles.featureAction} onPress={action}>
        <Text style={styles.featureActionText}>{actionText}</Text>
        <ChevronRight size={16} color="#bd84f6" />
      </Pressable>
    )}
  </View>
);

export default function SafetyCenterScreen() {
  const router = useRouter();
  const [safetySettings, setSafetySettings] = useState({
    locationSharing: true,
    profileVisibility: false,
    notificationAlerts: true,
    twoFactorAuth: false,
    emergencyContacts: true,
  });

  const toggleSetting = (setting: string) => {
    setSafetySettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const safetyFeatures = [
    {
      icon: Shield,
      title: "Verified Creches",
      description: "All creches on our platform are verified and meet safety standards",
      color: '#10b981'
    },
    {
      icon: Users,
      title: "Background Checks",
      description: "Creche staff undergo thorough background verification",
      color: '#3b82f6'
    },
    {
      icon: MapPin,
      title: "Location Safety",
      description: "Real-time location tracking and safe area notifications",
      color: '#8b5cf6'
    },
    {
      icon: FileText,
      title: "Safety Guidelines",
      description: "Comprehensive safety protocols for all partner creches",
      color: '#f59e0b'
    }
  ];

  const emergencyResources = [
    {
      title: "Emergency Services",
      number: "10111",
      description: "South African Police Service"
    },
    {
      title: "Ambulance",
      number: "10177",
      description: "Emergency Medical Services"
    },
    {
      title: "Childline",
      number: "0800 055 555",
      description: "24/7 Child Protection Helpline"
    },
    {
      title: "Gender-Based Violence",
      number: "0800 428 428",
      description: "GBV Command Centre"
    }
  ];

  const safetyTips = [
    "Always visit the creche in person before applying",
    "Verify the creche's registration with local authorities",
    "Check for safety certifications and emergency procedures",
    "Meet with the caregivers and staff members",
    "Ask about staff-to-child ratios and qualifications",
    "Inspect the facility for safety hazards",
    "Review the creche's policies and procedures"
  ];

  const handleEmergencyCall = (number: string) => {
    Alert.alert(
      'Emergency Call',
      `Call ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${number}`) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Safety Center</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Safety Overview */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Shield size={32} color="#ffffff" />
          </View>
          <Text style={styles.heroTitle}>Your Safety is Our Priority</Text>
          <Text style={styles.heroDescription}>
            We're committed to ensuring a safe and secure environment for your child and peace of mind for you.
          </Text>
        </View>

        {/* Safety Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Features</Text>
          <View style={styles.featuresGrid}>
            {safetyFeatures.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.cardIcon, { backgroundColor: feature.color }]}>
                  <feature.icon size={20} color="#ffffff" />
                </View>
                <Text style={styles.cardTitle}>{feature.title}</Text>
                <Text style={styles.cardDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Emergency Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Resources</Text>
          <Text style={styles.sectionSubtitle}>
            Important contacts for emergency situations
          </Text>
          
          <View style={styles.emergencyList}>
            {emergencyResources.map((resource, index) => (
              <Pressable
                key={index}
                style={styles.emergencyItem}
                onPress={() => handleEmergencyCall(resource.number)}
              >
                <View style={styles.emergencyContent}>
                  <Text style={styles.emergencyTitle}>{resource.title}</Text>
                  <Text style={styles.emergencyNumber}>{resource.number}</Text>
                  <Text style={styles.emergencyDescription}>{resource.description}</Text>
                </View>
                <View style={styles.emergencyAction}>
                  <Text style={styles.emergencyActionText}>Call</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Checklist</Text>
          <Text style={styles.sectionSubtitle}>
            Important things to consider when choosing a creche
          </Text>
          
          <View style={styles.tipsList}>
            {safetyTips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <CheckCircle size={16} color="#10b981" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Report Concern */}
        <View style={styles.reportSection}>
          <View style={styles.reportIcon}>
            <AlertTriangle size={24} color="#ffffff" />
          </View>
          <Text style={styles.reportTitle}>Report a Safety Concern</Text>
          <Text style={styles.reportDescription}>
            If you have any safety concerns about a creche or experience, please report it immediately.
          </Text>
          <Pressable 
            style={styles.reportButton}
            onPress={() => Alert.alert('Report', 'Report feature would open here')}
          >
            <Text style={styles.reportButtonText}>Report Concern</Text>
          </Pressable>
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
  heroSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
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
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  settingsList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  emergencyList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emergencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  emergencyNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 2,
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  emergencyAction: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emergencyActionText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
    lineHeight: 20,
  },
  reportSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  reportDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  reportButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reportButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  safetyFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  featureAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureActionText: {
    color: '#bd84f6',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});