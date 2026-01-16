import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  User,
  Shield,
  HelpCircle,
  Globe,
  FileText,
  LogOut,
  ChevronRight,
  X,
  AlertCircle,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import * as Location from 'expo-location';

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
  const { user, signOut, profile } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [settings, setSettings] = useState({
    locationServices: false,
  });
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
    checkLocationPermission();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status);
      setSettings(prev => ({ ...prev, locationServices: status === 'granted' }));
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const toggleLocationServices = async () => {
    if (settings.locationServices) {
      // Turning off location services
      setSettings(prev => ({ ...prev, locationServices: false }));
      // Optionally: Update user preferences in database
      await updateUserPreferences({ location_services_enabled: false });
    } else {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'granted') {
        setSettings(prev => ({ ...prev, locationServices: true }));
        // Optionally: Update user preferences in database
        await updateUserPreferences({ location_services_enabled: true });
        
        // Get current position to verify it works
        try {
          const location = await Location.getCurrentPositionAsync({});
          console.log('Location access granted:', location.coords);
        } catch (error) {
          console.error('Error getting location:', error);
        }
      } else {
        // Permission denied
        setSettings(prev => ({ ...prev, locationServices: false }));
        console.log('Location permission denied');
      }
    }
  };

  const updateUserPreferences = async (preferences: any) => {
    try {
      if (user?.id) {
        const { error } = await supabase
          .from('users')
          .update({
            preferences: preferences,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  };

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    try {
      setSignOutLoading(true);
      await signOut();
      setShowSignOutModal(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setSignOutLoading(false);
    }
  };

  const cancelSignOut = () => {
    setShowSignOutModal(false);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return user?.email?.charAt(0).toUpperCase() || 'U';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
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
      icon: Shield,
      title: "Privacy & Security",
      description: "Control your privacy settings",
      onPress: () => router.push('/safety-centre'),
      color: '#10b981',
      showArrow: true
    }
  ];

  const appSettings = [
    {
      icon: Globe,
      title: "Location Services",
      description: "Use your location for nearby creches",
      value: settings.locationServices,
      onToggle: toggleLocationServices,
      color: '#ef4444',
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
      onPress: () => router.push('/terms-policies'),
      color: '#6b7280',
      showArrow: true
    }
  ];

  return (
    <View style={styles.container}>
      {/* Sign Out Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSignOutModal}
        onRequestClose={cancelSignOut}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <AlertCircle size={24} color="#ef4444" />
              </View>
              <Pressable 
                style={styles.modalCloseButton}
                onPress={cancelSignOut}
              >
                <X size={20} color="#6b7280" />
              </Pressable>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sign Out?</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to sign out? You'll need to sign back in to access your account.
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelSignOut}
                disabled={signOutLoading}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.modalButton, styles.signOutConfirmButton]}
                onPress={confirmSignOut}
                disabled={signOutLoading}
              >
                <LogOut size={16} color="#FFFFFF" />
                <Text style={[styles.modalButtonText, styles.signOutConfirmButtonText]}>
                  Sign Out
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
            {loading ? (
              <View style={styles.avatarSkeleton} />
            ) : userProfile?.profile_picture_url ? (
              <Text style={styles.userAvatarText}>
                {getInitials(userProfile?.first_name, userProfile?.last_name)}
              </Text>
            ) : (
              <Text style={styles.userAvatarText}>
                {getInitials(profile?.first_name, profile?.last_name) || 'U'}
              </Text>
            )}
          </View>
          <View style={styles.userInfo}>
            {loading ? (
              <>
                <View style={[styles.skeletonText, { width: '60%', height: 18, marginBottom: 4 }]} />
                <View style={[styles.skeletonText, { width: '80%', height: 14 }]} />
              </>
            ) : (
              <>
                <Text style={styles.userName}>
                  {userProfile?.first_name && userProfile?.last_name 
                    ? `${userProfile.first_name} ${userProfile.last_name}`
                    : profile?.first_name && profile?.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : user?.email?.split('@')[0] || 'User'
                  }
                </Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
              </>
            )}
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

        {/* Sign Out */}
        <View style={styles.dangerSection}>
          <Pressable style={styles.dangerButton} onPress={handleSignOut}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.dangerButtonText}>Sign Out</Text>
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
  avatarSkeleton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e5e7eb',
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
  dangerButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutConfirmButton: {
    backgroundColor: '#ef4444',
  },
  signOutConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skeletonText: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
});