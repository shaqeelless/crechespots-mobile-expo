import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { User, CreditCard as Edit3, Calendar, Star, CreditCard, Settings, Bell, Shield, CircleHelp as HelpCircle, Baby, FileText, MapPin, Phone, Mail } from 'lucide-react-native';

// Mock user data - in a real app, this would come from Supabase
const userData = {
  id: '1',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@email.com',
  phoneNumber: '+27 82 123 4567',
  profilePictureUrl: null,
  address: '123 Main Street, Cape Town, Western Cape',
  memberSince: '2024-01-01',
  children: [
    {
      id: '1',
      firstName: 'Emma',
      lastName: 'Smith',
      dateOfBirth: '2020-03-15',
      gender: 'Female',
      profilePictureUrl: null,
    },
    {
      id: '2',
      firstName: 'Liam',
      lastName: 'Smith',
      dateOfBirth: '2018-07-22',
      gender: 'Male',
      profilePictureUrl: null,
    }
  ],
  stats: {
    applications: 5,
    acceptedApplications: 2,
    activeEnrollments: 1,
  }
};

export default function ProfileScreen() {
  const profileMenuItems = [
    { icon: Edit3, label: 'Edit Profile', color: '#f68484', route: '/profile/edit' },
    { icon: Baby, label: 'Manage Children', color: '#9cdcb8', route: '/children' },
    { icon: FileText, label: 'My Applications', color: '#84a7f6', route: '/applications' },
    { icon: Calendar, label: 'Application History', color: '#f6cc84', route: '/applications/history' },
    { icon: CreditCard, label: 'Payment Methods', color: '#f6cc84' },
    { icon: Bell, label: 'Notifications', color: '#bd84f6' },
    { icon: Settings, label: 'App Settings', color: '#f684a3' },
    { icon: Shield, label: 'Privacy & Safety', color: '#9cdcb8' },
    { icon: HelpCircle, label: 'Help & Support', color: '#84a7f6' },
  ];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

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
              {userData.profilePictureUrl ? (
                <Image source={{ uri: userData.profilePictureUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(userData.firstName, userData.lastName)}
                  </Text>
                </View>
              )}
              <Pressable style={styles.editAvatarButton}>
                <Edit3 size={14} color="#ffffff" />
              </Pressable>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userData.firstName} {userData.lastName}
              </Text>
              <Text style={styles.profileEmail}>{userData.email}</Text>
              <Text style={styles.memberSince}>
                Member since {new Date(userData.memberSince).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            <View style={styles.contactItem}>
              <Phone size={16} color="#6b7280" />
              <Text style={styles.contactText}>{userData.phoneNumber}</Text>
            </View>
            <View style={styles.contactItem}>
              <Mail size={16} color="#6b7280" />
              <Text style={styles.contactText}>{userData.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.contactText}>{userData.address}</Text>
            </View>
          </View>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.stats.applications}</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.stats.acceptedApplications}</Text>
              <Text style={styles.statLabel}>Accepted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.stats.activeEnrollments}</Text>
              <Text style={styles.statLabel}>Enrolled</Text>
            </View>
          </View>
        </View>

        {/* Children Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Children</Text>
          
          <View style={styles.childrenContainer}>
            {userData.children.map((child) => (
              <View key={child.id} style={styles.childCard}>
                <View style={styles.childAvatar}>
                  {child.profilePictureUrl ? (
                    <Image source={{ uri: child.profilePictureUrl }} style={styles.childAvatarImage} />
                  ) : (
                    <Text style={styles.childAvatarText}>
                      {getInitials(child.firstName, child.lastName)}
                    </Text>
                  )}
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>
                    {child.firstName} {child.lastName}
                  </Text>
                  <Text style={styles.childDetails}>
                    {calculateAge(child.dateOfBirth)} years old • {child.gender}
                  </Text>
                  <Text style={styles.childBirthdate}>
                    Born: {new Date(child.dateOfBirth).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
            
            <Pressable style={styles.addChildButton}>
              <Text style={styles.addChildText}>+ Add Child</Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsContainer}>
            <Pressable style={[styles.quickActionButton, { backgroundColor: '#84a7f6' }]}>
              <FileText size={24} color="#ffffff" />
              <Text style={styles.quickActionText}>New Application</Text>
            </Pressable>
            
            <Pressable style={[styles.quickActionButton, { backgroundColor: '#f68484' }]}>
              <Baby size={24} color="#ffffff" />
              <Text style={styles.quickActionText}>Add Child</Text>
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
                <Pressable key={index} style={styles.menuItem}>
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
});