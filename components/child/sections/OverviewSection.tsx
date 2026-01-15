import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  Image, 
  Alert, 
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Stethoscope,
  School,
  Heart,
  Pill,
  CalendarClock,
  BarChart3,
  Activity,
  Shield,
  MapPin,
  Users,
  Share2,
  UserPlus,
  Mail,
  ExternalLink,
  Camera,
} from 'lucide-react-native';
import { Child, Application, Student, AttendanceRecord, ChildInvite } from '../types';
import { Router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export interface OverviewSectionProps {
  child: Child;
  applications: Application[];
  students: Student[];
  attendance: AttendanceRecord[];
  invites: ChildInvite[];
  getStatusIcon: (status: string) => JSX.Element;
  getStatusColor: (status: string) => string;
  getAttendancePercentage: () => number;
  calculateAge: (dateOfBirth: string) => number;
  formatCurrency: (amount: number) => string;
  getProgressColor: (percentage: number) => string;
  router: Router;
  id: string;
  onProfilePictureUpdated?: (newImageUrl: string) => void;
}

export default function OverviewSection({
  child,
  applications,
  students,
  attendance,
  getStatusIcon,
  getStatusColor,
  getAttendancePercentage,
  calculateAge,
  formatCurrency,
  getProgressColor,
  router,
  id,
  onProfilePictureUpdated,
}: OverviewSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(child.profile_picture_url);

  const isChildEnrolledAsStudent = () => students.length > 0;
  
  const getTransferApplications = () => {
    return applications.filter(app => app.creche_id !== child.creche_id);
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera roll permission is required to upload images.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      
      console.log('Starting upload for child:', child.id);

      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `child_${child.id}_${timestamp}.jpg`;
      
      console.log('Uploading file:', fileName);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);
      
      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      const publicUrl = urlData.publicUrl;
      console.log('Uploaded to profile-pictures bucket:', publicUrl);

      // Update child in database
      console.log('Updating child with URL:', publicUrl);
      
      const { error: updateError } = await supabase
        .from('children')
        .update({
          profile_picture_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', child.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      console.log('Child profile updated successfully');

      // Update local state
      setProfilePicture(publicUrl);
      
      // Notify parent component if callback provided
      if (onProfilePictureUpdated) {
        onProfilePictureUpdated(publicUrl);
      }

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const renderEnrollmentStatus = () => {
    const enrolled = isChildEnrolledAsStudent();
    const currentCreche = child.creche;
    
    if (enrolled) {
      const studentCreche = students[0]?.creches?.name;
      return (
        <View style={styles.enrollmentBadge}>
          <CheckCircle size={16} color="#22c55e" />
          <Text style={styles.enrollmentBadgeText}>
            Enrolled at {studentCreche}
          </Text>
        </View>
      );
    } else if (currentCreche) {
      return (
        <View style={[styles.enrollmentBadge, { backgroundColor: '#f3f4f6' }]}>
          <School size={16} color="#6b7280" />
          <Text style={[styles.enrollmentBadgeText, { color: '#374151' }]}>
            Registered at {currentCreche.name}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.section}>
      {/* Hero Section */}
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.avatarContainer}>
            {child.relationship === 'owner' && (
              <Pressable 
                style={styles.avatarEditContainer}
                onPress={pickImage}
                disabled={uploading}
              >
                {profilePicture ? (
                  <Image
                    source={{ uri: profilePicture }}
                    style={styles.heroAvatar}
                  />
                ) : (
                  <View style={[
                    styles.heroAvatar, 
                    { 
                      backgroundColor: child.relationship === 'owner' ? '#8b5cf6' : '#06b6d4',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  ]}>
                    {uploading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Text style={styles.heroAvatarText}>
                          {child.first_name.charAt(0)}{child.last_name.charAt(0)}
                        </Text>
                        <View style={styles.cameraIconOverlay}>
                          <Camera size={14} color="#ffffff" />
                        </View>
                      </>
                    )}
                  </View>
                )}
                
                {/* Camera icon for uploaded images */}
                {profilePicture && !uploading && (
                  <View style={styles.cameraIconOverlay}>
                    <Camera size={14} color="#ffffff" />
                  </View>
                )}
                
                {/* Loading overlay */}
                {uploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color="#ffffff" />
                  </View>
                )}
              </Pressable>
            )}
            
            {/* Non-owner view (read-only) */}
            {child.relationship !== 'owner' && (
              <View style={styles.avatarContainer}>
                {profilePicture ? (
                  <Image
                    source={{ uri: profilePicture }}
                    style={styles.heroAvatar}
                  />
                ) : (
                  <View style={[
                    styles.heroAvatar, 
                    { 
                      backgroundColor: '#06b6d4',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  ]}>
                    <Text style={styles.heroAvatarText}>
                      {child.first_name.charAt(0)}{child.last_name.charAt(0)}
                    </Text>
                    <View style={styles.sharedAvatarBadge}>
                      <Users size={12} color="#ffffff" />
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
          <View style={styles.heroInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.heroName}>
                {child.first_name} {child.last_name}
              </Text>
              {child.relationship !== 'owner' && (
                <View style={styles.relationshipBadge}>
                  <Text style={styles.relationshipText}>
                    {child.relationship === 'parent' ? 'Shared' : child.relationship}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.heroAge}>
              {calculateAge(child.date_of_birth)} years old • {child.gender}
            </Text>
            <Text style={styles.heroSince}>
              Member since {new Date(child.created_at).getFullYear()}
            </Text>
            {renderEnrollmentStatus()}
            
            {/* Upload prompt for owners */}
            {child.relationship === 'owner' && !profilePicture && !uploading && (
              <Pressable 
                style={styles.uploadPrompt}
                onPress={pickImage}
              >
                <Text style={styles.uploadPromptText}>
                  Add a profile picture
                </Text>
              </Pressable>
            )}
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>{students.length}</Text>
            <Text style={styles.heroStatLabel}>Active</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>{applications.length}</Text>
            <Text style={styles.heroStatLabel}>Applications</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>{child.parents?.length || 0}</Text>
            <Text style={styles.heroStatLabel}>Parents</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions - Updated Edit Profile */}
      {child.relationship === 'owner' && (
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Pressable 
              style={styles.actionButton}
              onPress={() => router.push(`/children/${id}/edit`)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#8b5cf6' }]}>
                <ExternalLink size={24} color="#ffffff" />
              </View>
              <Text style={styles.actionText}>Edit Profile</Text>
            </Pressable>
            
            <Pressable 
              style={styles.actionButton}
              onPress={pickImage}
              disabled={uploading}
            >
              {uploading ? (
                <View style={[styles.actionIcon, { backgroundColor: '#9ca3af' }]}>
                  <ActivityIndicator size="small" color="#ffffff" />
                </View>
              ) : (
                <View style={[styles.actionIcon, { backgroundColor: '#10b981' }]}>
                  <Camera size={24} color="#ffffff" />
                </View>
              )}
              <Text style={styles.actionText}>
                {uploading ? 'Uploading...' : 'Update Photo'}
              </Text>
            </Pressable>
            
            <Pressable 
              style={styles.actionButton}
              onPress={() => router.push(`/children/${id}/share`)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#06b6d4' }]}>
                <UserPlus size={24} color="#ffffff" />
              </View>
              <Text style={styles.actionText}>Invite Parent</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Current Registration Info */}
      {child.creche && (
        <View style={styles.currentCrecheCard}>
          <View style={styles.currentCrecheHeader}>
            <School size={20} color="#8b5cf6" />
            <Text style={styles.currentCrecheTitle}>Current Registration</Text>
          </View>
          <View style={styles.currentCrecheContent}>
            <Image 
              source={{ uri: child.creche.header_image }} 
              style={styles.currentCrecheImage} 
            />
            <View style={styles.currentCrecheInfo}>
              <Text style={styles.currentCrecheName}>{child.creche.name}</Text>
              <Text style={styles.currentCrecheAddress}>
                <MapPin size={12} color="#64748b" /> {child.creche.address}
              </Text>
            </View>
          </View>
          <Text style={styles.currentCrecheNote}>
            This is where the child is currently registered. They can still apply to other creches.
          </Text>
        </View>
      )}

      {/* Transfer Applications */}
      {getTransferApplications().length > 0 && (
        <View style={styles.transferSection}>
          <Text style={styles.sectionTitle}>Transfer Applications</Text>
          <Text style={styles.sectionSubtitle}>
            Applying to different creches
          </Text>
          {getTransferApplications().map((application) => (
            <Pressable 
              key={application.id} 
              style={styles.applicationCard}
              onPress={() => router.push(`/applications/${application.id}`)}
            >
              <View style={styles.transferBadge}>
                <Text style={styles.transferBadgeText}>Transfer</Text>
              </View>
              <Image 
                source={{ uri: application.creches?.header_image }} 
                style={styles.crecheImage} 
              />
              <View style={styles.applicationInfo}>
                <Text style={styles.crecheName}>{application.creches?.name}</Text>
                <Text style={styles.applicationDate}>
                  Applied: {new Date(application.created_at).toLocaleDateString()}
                </Text>
                <View style={styles.statusRow}>
                  {getStatusIcon(application.application_status)}
                  <Text style={[
                    styles.statusText, 
                    { color: getStatusColor(application.application_status) }
                  ]}>
                    {application.application_status}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#8b5cf6' }]}>
          <View style={styles.statIconContainer}>
            <School size={20} color="#ffffff" />
          </View>
          <Text style={styles.statNumber}>{students.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#06b6d4' }]}>
          <View style={styles.statIconContainer}>
            <CalendarClock size={20} color="#ffffff" />
          </View>
          <Text style={styles.statNumber}>{getAttendancePercentage()}%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
          <View style={styles.statIconContainer}>
            <BarChart3 size={20} color="#ffffff" />
          </View>
          <Text style={styles.statNumber}>{applications.length}</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
          <View style={styles.statIconContainer}>
            <Users size={20} color="#ffffff" />
          </View>
          <Text style={styles.statNumber}>{child.parents?.length || 0}</Text>
          <Text style={styles.statLabel}>Parents</Text>
        </View>
      </View>

      {/* Progress Section */}
      {isChildEnrolledAsStudent() && (
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progress Overview</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Activity size={20} color="#374151" />
              <Text style={styles.progressTitle}>Attendance Rate</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${getAttendancePercentage()}%`,
                    backgroundColor: getProgressColor(getAttendancePercentage())
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {getAttendancePercentage()}% present in the last {attendance.length} days
            </Text>
          </View>
        </View>
      )}

      {/* Medical Summary */}
      {(child.allergies || child.special_needs || child.medical_conditions) && (
        <View style={styles.medicalSummary}>
          <Text style={styles.sectionTitle}>Health Summary</Text>
          <View style={styles.medicalSummaryCard}>
            <View style={styles.medicalSummaryHeader}>
              <Heart size={20} color="#ef4444" />
              <Text style={styles.medicalSummaryTitle}>Health Alerts</Text>
            </View>
            {child.allergies && (
              <View style={styles.medicalItem}>
                <AlertCircle size={16} color="#f59e0b" />
                <Text style={styles.medicalText}>Allergies: {child.allergies}</Text>
              </View>
            )}
            {child.special_needs && (
              <View style={styles.medicalItem}>
                <Shield size={16} color="#06b6d4" />
                <Text style={styles.medicalText}>Special Needs: {child.special_needs}</Text>
              </View>
            )}
            {child.medical_conditions && (
              <View style={styles.medicalItem}>
                <Pill size={16} color="#8b5cf6" />
                <Text style={styles.medicalText}>Conditions: {child.medical_conditions}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Section
  section: {
    padding: 16,
  },
  
  // Hero Section
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarEditContainer: {
    position: 'relative',
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8b5cf6',
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
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginRight: 8,
  },
  relationshipBadge: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  relationshipText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '600',
  },
  heroAge: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 2,
  },
  heroSince: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  enrollmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  enrollmentBadgeText: {
    fontSize: 14,
    color: '#166534',
    marginLeft: 6,
    fontWeight: '500',
  },
  uploadPrompt: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  uploadPromptText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
    textAlign: 'center',
  },
  sharedAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 20,
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Quick Actions
  quickActions: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Current Creche Card
  currentCrecheCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currentCrecheHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentCrecheTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  currentCrecheContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentCrecheImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  currentCrecheInfo: {
    flex: 1,
  },
  currentCrecheName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  currentCrecheAddress: {
    fontSize: 14,
    color: '#64748b',
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentCrecheNote: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  
  // Transfer Applications
  transferSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  applicationCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
  },
  transferBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  transferBadgeText: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  crecheImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  applicationInfo: {
    flex: 1,
  },
  crecheName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  applicationDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Progress Section
  progressSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
  },
  
  // Medical Summary
  medicalSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medicalSummaryCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  medicalSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicalSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginLeft: 8,
  },
  medicalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicalText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
});