import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
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
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      // Launch image picker - SIMPLIFIED: Remove mediaTypes or use correct property
      const result = await ImagePicker.launchImageLibraryAsync({
        // Try one of these options:
        // Option 1: Remove mediaTypes entirely (it defaults to images)
        // Option 2: Use string format
        mediaTypes: 'images', // Simple string format
        // Option 3: Use array format
        // mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Alternative: Check what properties are available
  const pickImageAlternative = async () => {
    try {
      console.log('ImagePicker object:', ImagePicker);
      console.log('Available properties:', Object.keys(ImagePicker));
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      // Try different approaches
      let result;
      
      // Approach 1: No mediaTypes property
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0].uri);
        return;
      }
      
    } catch (error) {
      console.error('Alternative picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please check console for details.');
    }
  };

const uploadImage = async (uri: string) => {
  try {
    setUploading(true);
    
    if (!profile?.id) {
      throw new Error('No user profile found');
    }

    console.log('Step 1: Converting image to blob...');
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `${profile.id}_${Date.now()}.jpg`;
    
    console.log('Step 2: Uploading to storage...');
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload failed:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    console.log('Step 3: Getting public URL...');
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);
    
    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) {
      throw new Error('Failed to generate public URL');
    }
    
    console.log('Public URL:', publicUrl);

    console.log('Step 4: Updating database...');
    // Try different approaches
    let updateError = null;
    let updateData = null;
    
    // Approach 1: Simple update without select
    const { error: error1 } = await supabase
      .from('users')
      .update({
        profile_picture_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    updateError = error1;
    
    // If Approach 1 fails, try Approach 2: With select but different syntax
    if (updateError) {
      console.log('Approach 1 failed, trying Approach 2...');
      const { data: data2, error: error2 } = await supabase
        .from('users')
        .update({
          profile_picture_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select()
        .single();
      
      updateError = error2;
      updateData = data2;
    }
    
    // If still failing, try Approach 3: Direct fetch
    if (updateError) {
      console.log('Approach 2 failed, trying direct fetch...');
      const { data: { session } } = await supabase.auth.getSession();
      
      const directResponse = await fetch(
        `https://bqydopqekazcedqvpxzo.supabase.co/rest/v1/users?id=eq.${profile.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': 'your-anon-key', // Get from Supabase settings
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal' // Changed from return=representation
          },
          body: JSON.stringify({
            profile_picture_url: publicUrl,
            updated_at: new Date().toISOString()
          })
        }
      );
      
      if (!directResponse.ok) {
        const errorText = await directResponse.text();
        throw new Error(`Direct update failed: ${directResponse.status} - ${errorText}`);
      }
      
      console.log('Direct update succeeded');
    } else {
      console.log('Database update succeeded via Supabase client');
    }

    console.log('Step 5: Refreshing profile data...');
    if (updateProfile) {
      await updateProfile();
    }

    Alert.alert('Success', 'Profile picture updated successfully!');
  } catch (error: any) {
    console.error('Full upload error:', error);
    
    // More detailed error messages
    let errorMessage = error.message || 'Failed to upload image';
    
    if (error.message?.includes('permission denied')) {
      errorMessage = 'Permission denied. Please check your database permissions.';
    } else if (error.message?.includes('violates row-level security')) {
      errorMessage = 'Security policy violation. Contact support.';
    } else if (error.message?.includes('400')) {
      errorMessage = 'Bad request. The update format might be incorrect.';
    }
    
    Alert.alert('Error', errorMessage);
  } finally {
    setUploading(false);
  }
};

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
              <Pressable 
                style={styles.avatarWrapper}
                onPress={pickImage} // Try pickImageAlternative if this doesn't work
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
});