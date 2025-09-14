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
import { User, CreditCard as Edit3, Calendar, Star, CreditCard, Settings, Bell, Shield, CircleHelp as HelpCircle, Baby, FileText, MapPin, Phone, Mail, LogOut } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const profileMenuItems = [
    { icon: Edit3, label: 'Edit Profile', color: '#f68484', route: '/profile/edit', onPress: () => router.push('/profile/edit') },
    { icon: Baby, label: 'Manage Children', color: '#9cdcb8', route: '/children', onPress: () => router.push('/children') },
    { icon: FileText, label: 'My Applications', color: '#84a7f6', route: '/applications', onPress: () => router.push('/applications') },
    { icon: Calendar, label: 'Application History', color: '#f6cc84', route: '/applications/history', onPress: () => router.push('/applications/history') },
    { icon: CreditCard, label: 'Payment Methods', color: '#f6cc84', onPress: () => {} },
    { icon: Bell, label: 'Notifications', color: '#bd84f6', onPress: () => {} },
    { icon: Settings, label: 'App Settings', color: '#f684a3', onPress: () => {} },
    { icon: Shield, label: 'Privacy & Safety', color: '#9cdcb8', onPress: () => {} },
    { icon: HelpCircle, label: 'Help & Support', color: '#84a7f6', onPress: () => {} },
  ];

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (!error) {
              router.replace('/(auth)/welcome');
            }
          }
        },
      ]
    );
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profile.profile_picture_url ? (
                <Image source={{ uri: profile.profile_picture_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(profile.first_name, profile.last_name)}
                  </Text>
                </View>
              )}
              <Pressable style={styles.editAvatarButton} onPress={() => router.push('/profile/edit')}>
                <Edit3 size={14} color="#ffffff" />
              </Pressable>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile.first_name} {profile.last_name}
              </Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              <Text style={styles.memberSince}>
                Member since {new Date(profile.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
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
                  {[profile.suburb, profile.city, profile.province].filter(Boolean).join(', ')}
                </Text>
              </View>
            )}
          </View>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Accepted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Enrolled</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsContainer}>
            <Pressable 
              style={[styles.quickActionButton, { backgroundColor: '#84a7f6' }]}
              onPress={() => router.push('/applications')}
            >
              <FileText size={24} color="#ffffff" />
              <Text style={styles.quickActionText}>My Applications</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.quickActionButton, { backgroundColor: '#9cdcb8' }]}
              onPress={() => router.push('/children')}
            >
              <Baby size={24} color="#ffffff" />
              <Text style={styles.quickActionText}>Manage Children</Text>
            </Pressable>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <View style={styles.menuContainer}>
            {profileMenuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Pressable key={index} style={styles.menuItem} onPress={item.onPress}>
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
          <Pressable style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfoContainer}>
            <View style={styles.logoContainer}>
              <View style={[styles.letterBlock, { backgroundColor: '#f68484' }]}>
                <Text style={styles.letterText}>C</Text>
              </View>
              <View style={[styles.letterBlock, { backgroundColor: '#f68484' }]}>
                <Text style={styles.letterText}>R</Text>
              </View>
              <View style={[styles.letterBlock, { backgroundColor: '#9cdcb8' }]}>
                <Text style={styles.letterText}>E</Text>
              </View>
              <View style={[styles.letterBlock, { backgroundColor: '#84a7f6' }]}>
                <Text style={styles.letterText}>C</Text>
              </View>
              <View style={[styles.letterBlock, { backgroundColor: '#f6cc84' }]}>
                <Text style={styles.letterText}>H</Text>
              </View>
              <View style={[styles.letterBlock, { backgroundColor: '#bd84f6' }]}>
                <Text style={styles.letterText}>E</Text>
              </View>
            </View>
            <Text style={styles.logoSubtext}>SPOTS</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#ffffff',
    marginBottom: 24,
    paddingBottom: 24,
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
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#bd4ab5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
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
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 14,
    color: '#9ca3af',
  },
  contactSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e5e7eb',
  },
  childrenContainer: {
    gap: 12,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9cdcb8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  childAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  childAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  childDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  childBirthdate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  addChildButton: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#bd4ab5',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addChildText: {
    color: '#bd4ab5',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    opacity: 0.9,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  menuContainer: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
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
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
    color: '#9ca3af',
    fontWeight: '300',
  },
  appInfoContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  letterBlock: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
    opacity: 0.9,
  },
  letterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoSubtext: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 12,
    color: '#9ca3af',
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
    marginLeft: 8,
  },
});