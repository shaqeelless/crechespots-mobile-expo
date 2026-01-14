import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
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
} from 'lucide-react-native';
import { Child, Application, Student, AttendanceRecord, ChildInvite } from '../types';
import { Router } from 'expo-router';
import {
  sharedStyles,
  overviewStyles,
  applicationsStyles,
} from '../styles';

interface OverviewSectionProps {
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
}: OverviewSectionProps) {
  const isChildEnrolledAsStudent = () => students.length > 0;
  
  const getTransferApplications = () => {
    return applications.filter(app => app.creche_id !== child.creche_id);
  };

  const renderEnrollmentStatus = () => {
    const enrolled = isChildEnrolledAsStudent();
    const currentCreche = child.creche;
    
    if (enrolled) {
      const studentCreche = students[0]?.creches?.name;
      return (
        <View style={overviewStyles.enrollmentBadge}>
          <CheckCircle size={16} color="#22c55e" />
          <Text style={overviewStyles.enrollmentBadgeText}>
            Enrolled at {studentCreche}
          </Text>
        </View>
      );
    } else if (currentCreche) {
      return (
        <View style={[overviewStyles.enrollmentBadge, { backgroundColor: '#f3f4f6' }]}>
          <School size={16} color="#6b7280" />
          <Text style={[overviewStyles.enrollmentBadgeText, { color: '#374151' }]}>
            Registered at {currentCreche.name}
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={sharedStyles.section}>
      {/* Hero Section */}
      <View style={overviewStyles.heroCard}>
        <View style={overviewStyles.heroContent}>
          <View style={overviewStyles.avatarContainer}>
            {child.profile_picture_url ? (
              <Image
                source={{ uri: child.profile_picture_url }}
                style={overviewStyles.heroAvatar}
              />
            ) : (
              <View style={[overviewStyles.heroAvatar, { backgroundColor: child.relationship === 'owner' ? '#8b5cf6' : '#06b6d4' }]}>
                <Text style={overviewStyles.heroAvatarText}>
                  {child.first_name.charAt(0)}{child.last_name.charAt(0)}
                </Text>
                {child.relationship !== 'owner' && (
                  <View style={overviewStyles.sharedAvatarBadge}>
                    <Users size={12} color="#ffffff" />
                  </View>
                )}
              </View>
            )}
          </View>
          <View style={overviewStyles.heroInfo}>
            <View style={overviewStyles.nameContainer}>
              <Text style={overviewStyles.heroName}>
                {child.first_name} {child.last_name}
              </Text>
              {child.relationship !== 'owner' && (
                <View style={overviewStyles.relationshipBadge}>
                  <Text style={overviewStyles.relationshipText}>
                    {child.relationship === 'parent' ? 'Shared' : child.relationship}
                  </Text>
                </View>
              )}
            </View>
            <Text style={overviewStyles.heroAge}>
              {calculateAge(child.date_of_birth)} years old • {child.gender}
            </Text>
            <Text style={overviewStyles.heroSince}>
              Member since {new Date(child.created_at).getFullYear()}
            </Text>
            {renderEnrollmentStatus()}
          </View>
        </View>
        <View style={overviewStyles.heroStats}>
          <View style={overviewStyles.heroStat}>
            <Text style={overviewStyles.heroStatNumber}>{students.length}</Text>
            <Text style={overviewStyles.heroStatLabel}>Active</Text>
          </View>
          <View style={overviewStyles.heroStat}>
            <Text style={overviewStyles.heroStatNumber}>{applications.length}</Text>
            <Text style={overviewStyles.heroStatLabel}>Applications</Text>
          </View>
          <View style={overviewStyles.heroStat}>
            <Text style={overviewStyles.heroStatNumber}>{child.parents?.length || 0}</Text>
            <Text style={overviewStyles.heroStatLabel}>Parents</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      {child.relationship === 'owner' && (
        <View style={overviewStyles.quickActions}>
          <Text style={sharedStyles.sectionTitle}>Quick Actions</Text>
          <View style={overviewStyles.actionsGrid}>
            <Pressable 
              style={overviewStyles.actionButton}
              onPress={() => router.push(`/children/${id}/edit`)}
            >
              <View style={[overviewStyles.actionIcon, { backgroundColor: '#8b5cf6' }]}>
                <ExternalLink size={24} color="#ffffff" />
              </View>
              <Text style={overviewStyles.actionText}>Edit Profile</Text>
            </Pressable>
            <Pressable 
              style={overviewStyles.actionButton}
              onPress={() => router.push(`/children/${id}/share`)}
            >
              <View style={[overviewStyles.actionIcon, { backgroundColor: '#06b6d4' }]}>
                <UserPlus size={24} color="#ffffff" />
              </View>
              <Text style={overviewStyles.actionText}>Invite Parent</Text>
            </Pressable>
            <Pressable 
              style={overviewStyles.actionButton}
              onPress={() => router.push(`/apply/${child.id}`)}
            >
              <View style={[overviewStyles.actionIcon, { backgroundColor: '#10b981' }]}>
                <School size={24} color="#ffffff" />
              </View>
              <Text style={overviewStyles.actionText}>Apply to Creche</Text>
            </Pressable>
            <Pressable 
              style={overviewStyles.actionButton}
              onPress={() => {/* Handle share code */}}
              disabled={!child.share_code}
            >
              <View style={[overviewStyles.actionIcon, { backgroundColor: child.share_code ? '#f59e0b' : '#d1d5db' }]}>
                <Share2 size={24} color="#ffffff" />
              </View>
              <Text style={overviewStyles.actionText}>Share Access</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Current Registration Info */}
      {child.creche && (
        <View style={overviewStyles.currentCrecheCard}>
          <View style={overviewStyles.currentCrecheHeader}>
            <School size={20} color="#8b5cf6" />
            <Text style={overviewStyles.currentCrecheTitle}>Current Registration</Text>
          </View>
          <View style={overviewStyles.currentCrecheContent}>
            <Image 
              source={{ uri: child.creche.header_image }} 
              style={overviewStyles.currentCrecheImage} 
            />
            <View style={overviewStyles.currentCrecheInfo}>
              <Text style={overviewStyles.currentCrecheName}>{child.creche.name}</Text>
              <Text style={overviewStyles.currentCrecheAddress}>
                <MapPin size={12} color="#64748b" /> {child.creche.address}
              </Text>
            </View>
          </View>
          <Text style={overviewStyles.currentCrecheNote}>
            This is where the child is currently registered. They can still apply to other creches.
          </Text>
        </View>
      )}

      {/* Transfer Applications */}
      {getTransferApplications().length > 0 && (
        <View style={overviewStyles.transferSection}>
          <Text style={sharedStyles.sectionTitle}>Transfer Applications</Text>
          <Text style={sharedStyles.sectionSubtitle}>
            Applying to different creches
          </Text>
          {getTransferApplications().map((application) => (
            <Pressable 
              key={application.id} 
              style={applicationsStyles.applicationCard}
              onPress={() => router.push(`/applications/${application.id}`)}
            >
              <View style={overviewStyles.transferBadge}>
                <Text style={overviewStyles.transferBadgeText}>Transfer</Text>
              </View>
              <Image 
                source={{ uri: application.creches?.header_image }} 
                style={applicationsStyles.crecheImage} 
              />
              <View style={applicationsStyles.applicationInfo}>
                <Text style={applicationsStyles.crecheName}>{application.creches?.name}</Text>
                <Text style={applicationsStyles.applicationDate}>
                  Applied: {new Date(application.created_at).toLocaleDateString()}
                </Text>
                <View style={applicationsStyles.statusRow}>
                  {getStatusIcon(application.application_status)}
                  <Text style={[
                    applicationsStyles.statusText, 
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
      <View style={overviewStyles.statsGrid}>
        <View style={[overviewStyles.statCard, { backgroundColor: '#8b5cf6' }]}>
          <View style={overviewStyles.statIconContainer}>
            <School size={20} color="#ffffff" />
          </View>
          <Text style={overviewStyles.statNumber}>{students.length}</Text>
          <Text style={overviewStyles.statLabel}>Active</Text>
        </View>
        <View style={[overviewStyles.statCard, { backgroundColor: '#06b6d4' }]}>
          <View style={overviewStyles.statIconContainer}>
            <CalendarClock size={20} color="#ffffff" />
          </View>
          <Text style={overviewStyles.statNumber}>{getAttendancePercentage()}%</Text>
          <Text style={overviewStyles.statLabel}>Attendance</Text>
        </View>
        <View style={[overviewStyles.statCard, { backgroundColor: '#10b981' }]}>
          <View style={overviewStyles.statIconContainer}>
            <BarChart3 size={20} color="#ffffff" />
          </View>
          <Text style={overviewStyles.statNumber}>{applications.length}</Text>
          <Text style={overviewStyles.statLabel}>Reports</Text>
        </View>
        <View style={[overviewStyles.statCard, { backgroundColor: '#f59e0b' }]}>
          <View style={overviewStyles.statIconContainer}>
            <Users size={20} color="#ffffff" />
          </View>
          <Text style={overviewStyles.statNumber}>{child.parents?.length || 0}</Text>
          <Text style={overviewStyles.statLabel}>Parents</Text>
        </View>
      </View>

      {/* Progress Section */}
      {isChildEnrolledAsStudent() && (
        <View style={overviewStyles.progressSection}>
          <Text style={sharedStyles.sectionTitle}>Progress Overview</Text>
          <View style={overviewStyles.progressCard}>
            <View style={overviewStyles.progressHeader}>
              <Activity size={20} color="#374151" />
              <Text style={overviewStyles.progressTitle}>Attendance Rate</Text>
            </View>
            <View style={overviewStyles.progressBarContainer}>
              <View 
                style={[
                  overviewStyles.progressBar, 
                  { 
                    width: `${getAttendancePercentage()}%`,
                    backgroundColor: getProgressColor(getAttendancePercentage())
                  }
                ]} 
              />
            </View>
            <Text style={overviewStyles.progressText}>
              {getAttendancePercentage()}% present in the last {attendance.length} days
            </Text>
          </View>
        </View>
      )}

      {/* Medical Summary */}
      {(child.allergies || child.special_needs || child.medical_conditions) && (
        <View style={overviewStyles.medicalSummary}>
          <Text style={sharedStyles.sectionTitle}>Health Summary</Text>
          <View style={overviewStyles.medicalSummaryCard}>
            <View style={overviewStyles.medicalSummaryHeader}>
              <Heart size={20} color="#ef4444" />
              <Text style={overviewStyles.medicalSummaryTitle}>Health Alerts</Text>
            </View>
            {child.allergies && (
              <View style={overviewStyles.medicalItem}>
                <AlertCircle size={16} color="#f59e0b" />
                <Text style={overviewStyles.medicalText}>Allergies: {child.allergies}</Text>
              </View>
            )}
            {child.special_needs && (
              <View style={overviewStyles.medicalItem}>
                <Shield size={16} color="#06b6d4" />
                <Text style={overviewStyles.medicalText}>Special Needs: {child.special_needs}</Text>
              </View>
            )}
            {child.medical_conditions && (
              <View style={overviewStyles.medicalItem}>
                <Pill size={16} color="#8b5cf6" />
                <Text style={overviewStyles.medicalText}>Conditions: {child.medical_conditions}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}