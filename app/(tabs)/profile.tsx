import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Modal,
  ActivityIndicator,
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
  Camera,
  X,
  AlertCircle,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

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
  const { profile, signOut, loading: authLoading, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

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

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        // Instead of Alert, you could show a toast or inline message
        console.warn('Camera roll permissions not granted');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      // You could show a toast notification here instead
      console.error('Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      
      if (!profile?.id) {
        throw new Error('No user profile found');
      }

      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `${profile.id}_${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);
      
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) {
        throw new Error('Failed to generate public URL');
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          profile_picture_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      if (updateProfile) {
        await updateProfile();
      }
      
      console.log('Profile picture updated successfully!');
      // You could show a success toast here
    } catch (error: any) {
      console.error('Upload error:', error.message || error);
      // You could show an error toast here instead
    } finally {
      setUploading(false);
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
      // You could show an error toast here
    } finally {
      setSignOutLoading(false);
    }
  };

  const cancelSignOut = () => {
    setShowSignOutModal(false);
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
                {signOutLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <LogOut size={16} color="#FFFFFF" />
                    <Text style={[styles.modalButtonText, styles.signOutConfirmButtonText]}>
                      Sign Out
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
              <Pressable 
                style={styles.avatarWrapper}
                onPress={pickImage}
                disabled={uploading}
              >
                {uploading ? (
                  <View style={[styles.avatar, styles.avatarUploading]}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                ) : profile.profile_picture_url ? (
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
                
                {/* Camera icon overlay */}
                <View style={styles.cameraIconContainer}>
                  <Camera size={14} color="#FFFFFF" />
                </View>
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

          {/* Upload prompt */}
          {!profile.profile_picture_url && !uploading && (
            <Pressable style={styles.uploadPrompt} onPress={pickImage}>
              <Text style={styles.uploadPromptText}>
                Add a profile picture
              </Text>
            </Pressable>
          )}

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
    paddingBottom: 40,
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
    marginBottom: 12,
  },
  avatarContainer: { 
    position: 'relative', 
    marginRight: 16 
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarUploading: {
    backgroundColor: '#6B7280',
  },
  avatarText: { 
    color: '#FFFFFF', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
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
  uploadPrompt: {
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  uploadPromptText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
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
    height: 60,
  },
  skeletonText: { 
    borderRadius: 4, 
    backgroundColor: '#e5e7eb' 
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
});