import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CreditCard as Edit3,
  Calendar,
  CreditCard,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  Baby,
  FileText,
  MapPin,
  Phone,
  Mail,
  LogOut,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

// Skeleton loader
const ProfileSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <View
        style={[
          styles.skeletonText,
          { width: 80, height: 24, backgroundColor: '#e5e7eb' },
        ]}
      />
    </View>
    <ScrollView style={styles.content}>
      {/* Profile Section Skeleton */}
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: '#e5e7eb' }]} />
          <View style={styles.profileInfo}>
            <View
              style={[
                styles.skeletonText,
                { width: '60%', height: 20, marginBottom: 8 },
              ]}
            />
            <View
              style={[
                styles.skeletonText,
                { width: '80%', height: 16, marginBottom: 4 },
              ]}
            />
            <View
              style={[styles.skeletonText, { width: '40%', height: 14 }]}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut, loading: authLoading } = useAuth();

  const profileMenuItems = [
    {
      icon: Edit3,
      label: 'Edit Profile',
      color: '#f68484',
      onPress: () => router.push('/profile/edit'),
    },
    {
      icon: FileText,
      label: 'My Applications',
      color: '#84a7f6',
      onPress: () => router.push('/applications'),
    },
    { icon: CreditCard, label: 'Billing', color: '#f6cc84', onPress: () => router.push('/billing') },
    { icon: Settings, label: 'App Settings', color: '#f684a3', onPress: () => router.push('/settings') },
    { icon: Shield, label: 'Privacy & Safety', color: '#9cdcb8', onPress: () => router.push('/privacy-policies') },
    { icon: HelpCircle, label: 'Help & Support', color: '#84a7f6', onPress: () => router.push('/help-support') },
  ];

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await signOut();
            // Handle different response formats
            if (result?.error || result === false) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } else {
              router.replace('/(auth)/welcome');
            }
          } catch (error) {
            console.error('Sign out error:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (authLoading || !profile) {
    return <ProfileSkeleton />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profile.profile_picture_url ? (
                <Image
                  source={{ uri: profile.profile_picture_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(profile.first_name, profile.last_name)}
                  </Text>
                </View>
              )}
              <Pressable
                style={styles.editAvatarButton}
                onPress={() => router.push('/profile/edit')}
              >
                <Edit3 size={14} color="#ffffff" />
              </Pressable>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile.first_name} {profile.last_name}
              </Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              <Text style={styles.memberSince}>
                Member since{' '}
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            {profile.phone_number && (
              <View style={styles.contactItem}>
                <Phone size={16} color="#6b7280" />
                <Text style={styles.contactText}>{profile.phone_number}</Text>
              </View>
            )}
            <View style={styles.contactItem}>
              <Mail size={16} color="#6b7280" />
              <Text style={styles.contactText}>{profile.email}</Text>
            </View>
            {(profile.city || profile.province) && (
              <View style={styles.contactItem}>
                <MapPin size={16} color="#6b7280" />
                <Text style={styles.contactText}>
                  {[profile.suburb, profile.city, profile.province]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.menuContainer}>
            {profileMenuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Pressable
                  key={index}
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                    <IconComponent size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <Pressable 
            style={styles.signOutButton} 
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        {/* Extra padding at the bottom for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f4fcfe' 
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#374151' 
  },
  content: { 
    flex: 1 
  },
  scrollContent: {
    paddingBottom: 40, // Extra padding for better scroll
  },
  profileSection: {
    backgroundColor: '#ffffff',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomEndRadius: 150,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 20,
  },
  avatarContainer: { 
    position: 'relative', 
    marginRight: 16 
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#bd84f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { 
    color: '#ffffff', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileInfo: { 
    flex: 1 
  },
  profileName: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#374151', 
    marginBottom: 4 
  },
  profileEmail: { 
    fontSize: 16, 
    color: '#6b7280', 
    marginBottom: 2 
  },
  memberSince: { 
    fontSize: 14, 
    color: '#9ca3af' 
  },
  contactSection: { 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  contactItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  contactText: { 
    fontSize: 14, 
    color: '#6b7280', 
    marginLeft: 8, 
    flex: 1 
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#374151', 
    marginBottom: 16 
  },
  menuContainer: { 
    gap: 4 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16 
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    opacity: 0.9,
  },
  menuLabel: { 
    flex: 1, 
    fontSize: 16, 
    color: '#374151', 
    fontWeight: '500' 
  },
  menuArrow: { 
    fontSize: 20, 
    color: '#9ca3af', 
    fontWeight: '300' 
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  signOutText: { 
    color: '#ef4444', 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 8 
  },
  bottomPadding: {
    height: 60, // Extra space at bottom for better scrolling
  },
  skeletonText: { 
    borderRadius: 4, 
    backgroundColor: '#e5e7eb' 
  },
});