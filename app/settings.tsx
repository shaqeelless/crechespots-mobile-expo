import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  HelpCircle,
  Moon,
  Globe,
  FileText,
  LogOut,
  ChevronRight,
  Mail,
  Star,
  Share2,
  Trash2,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

const SettingsItem = ({ icon: Icon, title, description, value, onPress, onToggle, showSwitch, showArrow, color }: any) => (
  <Pressable 
    style={styles.settingsItem} 
    onPress={onPress}
    disabled={showSwitch}
  >
    <View style={[styles.itemIcon, { backgroundColor: color }]}>
      <Icon size={20} color="#ffffff" />
    </View>
    <View style={styles.itemContent}>
      <Text style={styles.itemTitle}>{title}</Text>
      {description && <Text style={styles.itemDescription}>{description}</Text>}
    </View>
    {showSwitch && (
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#e5e7eb', true: '#bd84f6' }}
        thumbColor="#ffffff"
      />
    )}
    {showArrow && <ChevronRight size={20} color="#9ca3af" />}
  </Pressable>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    locationServices: true,
    biometricAuth: false,
    emailUpdates: true,
    smsAlerts: false,
  });

  const toggleSetting = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: () => Alert.alert('Account Deletion', 'Account deletion feature would be implemented here')
        }
      ]
    );
  };

  const accountSettings = [
    {
      icon: User,
      title: "Profile Information",
      description: "Update your personal details and preferences",
      onPress: () => router.push('/profile/edit'),
      color: '#3b82f6',
      showArrow: true
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Manage your notification preferences",
      onPress: () => router.push('/notifications'),
      color: '#8b5cf6',
      showArrow: true
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Control your privacy settings",
      onPress: () => router.push('/safety-center'),
      color: '#10b981',
      showArrow: true
    }
  ];

  const appSettings = [
    {
      icon: Bell,
      title: "Push Notifications",
      description: "Receive app notifications",
      value: settings.notifications,
      onToggle: () => toggleSetting('notifications'),
      color: '#f59e0b',
      showSwitch: true
    },
    {
      icon: Moon,
      title: "Dark Mode",
      description: "Switch to dark theme",
      value: settings.darkMode,
      onToggle: () => toggleSetting('darkMode'),
      color: '#6b7280',
      showSwitch: true
    },
    {
      icon: Globe,
      title: "Location Services",
      description: "Use your location for nearby creches",
      value: settings.locationServices,
      onToggle: () => toggleSetting('locationServices'),
      color: '#ef4444',
      showSwitch: true
    },
    {
      icon: Shield,
      title: "Biometric Authentication",
      description: "Use fingerprint or face ID to login",
      value: settings.biometricAuth,
      onToggle: () => toggleSetting('biometricAuth'),
      color: '#10b981',
      showSwitch: true
    }
  ];

  const supportSettings = [
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "Get help and contact support",
      onPress: () => router.push('/help-support'),
      color: '#3b82f6',
      showArrow: true
    },
    {
      icon: FileText,
      title: "Terms & Policies",
      description: "View our terms of service and privacy policy",
      onPress: () => Alert.alert('Terms', 'Terms and policies would open here'),
      color: '#6b7280',
      showArrow: true
    },
    {
      icon: Star,
      title: "Rate Our App",
      description: "Share your experience with us",
      onPress: () => Alert.alert('Rate App', 'App store rating would open here'),
      color: '#f59e0b',
      showArrow: true
    },
    {
      icon: Share2,
      title: "Share App",
      description: "Share CrecheSpots with other parents",
      onPress: () => Alert.alert('Share', 'Share functionality would open here'),
      color: '#8b5cf6',
      showArrow: true
    }
  ];

  const communicationSettings = [
    {
      icon: Mail,
      title: "Email Updates",
      description: "Receive updates and newsletters via email",
      value: settings.emailUpdates,
      onToggle: () => toggleSetting('emailUpdates'),
      color: '#3b82f6',
      showSwitch: true
    },
    {
      icon: Bell,
      title: "SMS Alerts",
      description: "Get important alerts via SMS",
      value: settings.smsAlerts,
      onToggle: () => toggleSetting('smsAlerts'),
      color: '#10b981',
      showSwitch: true
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.user_metadata?.name || 'User'}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsGroup}>
            {accountSettings.map((item, index) => (
              <SettingsItem key={index} {...item} />
            ))}
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.settingsGroup}>
            {appSettings.map((item, index) => (
              <SettingsItem key={index} {...item} />
            ))}
          </View>
        </View>

        {/* Communication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>
          <View style={styles.settingsGroup}>
            {communicationSettings.map((item, index) => (
              <SettingsItem key={index} {...item} />
            ))}
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsGroup}>
            {supportSettings.map((item, index) => (
              <SettingsItem key={index} {...item} />
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>CrecheSpots v1.0.1</Text>
          <Text style={styles.appCopyright}>© 2024 CrecheSpots. All rights reserved.</Text>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Pressable style={styles.dangerButton} onPress={handleSignOut}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.dangerButtonText}>Sign Out</Text>
          </Pressable>
          
          <Pressable style={[styles.dangerButton, styles.deleteButton]} onPress={handleDeleteAccount}>
            <Trash2 size={20} color="#ef4444" />
            <Text style={styles.dangerButtonText}>Delete Account</Text>
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
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#bd84f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingsGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appVersion: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#9ca3af',
  },
  dangerSection: {
    gap: 12,
    marginBottom: 40,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  deleteButton: {
    borderColor: '#fef2f2',
    backgroundColor: '#fef2f2',
  },
  dangerButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});