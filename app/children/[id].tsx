import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Clipboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Stethoscope,
  BookOpen,
  School,
  Heart,
  Pill,
  CalendarClock,
  BarChart3,
  Activity,
  Shield,
  MapPin,
  Users,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  profile_picture_url: string;
  special_needs?: string;
  allergies?: string;
  medical_conditions?: string;
  created_at: string;
  parent_id: string;
  creche_id: string;
  share_code?: string;
  creche?: {
    id: string;
    name: string;
    header_image: string;
    address: string;
  };
  parents?: ChildParent[];
}

interface ChildParent {
  id: string;
  child_id: string;
  user_id: string;
  relationship: string;
  is_verified: boolean;
  invited_by?: string;
  invitation_id?: string;
  permissions: any;
  created_at: string;
  updated_at: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
}

interface Application {
  id: string;
  application_status: string;
  created_at: string;
  parent_name: string;
  parent_phone_number: string;
  parent_email: string;
  message: string;
  child_id: string;
  creche_id: string;
  creches: {
    id: string;
    name: string;
    header_image: string;
    address: string;
    email: string;
    phone_number: string;
  };
}

interface Student {
  id: string;
  name: string;
  dob: string;
  creche_id: string;
  child_id: string;
  application_id: string;
  class: string;
  fees_owed: number;
  fees_paid: number;
  profile_picture: string;
  user_id: string;
  parent_name: string;
  parent_phone_number: string;
  parent_email: string;
  creches: {
    name: string;
    header_image: string;
    address: string;
  };
}

interface AttendanceRecord {
  id: string;
  attendance_date: string;
  status: string;
  created_at: string;
  student_id: string;
}

interface ApplicationNote {
  id: string;
  note: string;
  created_at: string;
  users: {
    first_name: string;
    last_name: string;
  };
}

interface MedicalRecord {
  id: string;
  immunization_status: string;
  allergies: string;
  last_checkup: string;
  next_checkup: string;
  medical_notes: string;
  student_id: string;
  creches: {
    name: string;
  };
}

interface Invoice {
  id: string;
  creche_id: string;
  student_id: string;
  child_id: string;
  title: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  prepared_by: string;
  prepared_for: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  application_id: string;
  creches?: {
    name: string;
    header_image: string;
  };
  students?: {
    name: string;
  };
  children?: {
    first_name: string;
    last_name: string;
  };
}

export default function ChildDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [child, setChild] = useState<Child | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [applicationNotes, setApplicationNotes] = useState<ApplicationNote[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchChildData();
    }
  }, [id]);

  const fetchChildData = async () => {
    try {
      setLoading(true);

      // Fetch child details WITH current creche info AND parents
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select(`
          *,
          creche:creches(id, name, header_image, address)
        `)
        .eq('id', id)
        .single();

      if (childError) throw childError;
      setChild(childData);

      // Fetch all related data in parallel
      await Promise.all([
        fetchApplications(childData.id),
        fetchStudents(childData.id),
        fetchInvoices(childData.id),
        fetchChildParents(childData.id),
      ]);

    } catch (error) {
      console.error('Error fetching child data:', error);
      Alert.alert('Error', 'Failed to load child details');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildParents = async (childId: string) => {
    try {
      const { data, error } = await supabase
        .from('child_parents')
        .select(`
          *,
          users(first_name, last_name, email, phone_number)
        `)
        .eq('child_id', childId)
        .eq('is_verified', true);

      if (error) throw error;
      
      // Update child with parents data
      setChild(prev => prev ? { ...prev, parents: data || [] } : null);
    } catch (error) {
      console.error('Error fetching child parents:', error);
    }
  };

  const fetchInvoices = async (childId: string) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          creches(name, header_image),
          students(name),
          children(first_name, last_name)
        `)
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchApplications = async (childId: string) => {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        creches(*)
      `)
      .eq('child_id', childId)
      .order('created_at', { ascending: false });

    if (!error) {
      setApplications(data || []);
      
      // Fetch application notes after we have applications
      if (data && data.length > 0) {
        const applicationIds = data.map(app => app.id);
        await fetchApplicationNotes(applicationIds);
      }
    }
  };

  const fetchStudents = async (childId: string) => {
    // Fetch students directly by child_id
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select(`
        *,
        creches(name, header_image, address)
      `)
      .eq('child_id', childId)
      .order('created_at', { ascending: false });

    if (!studentsError && studentsData) {
      setStudents(studentsData || []);
      
      // Fetch attendance and medical records for these students
      if (studentsData.length > 0) {
        const studentIds = studentsData.map(student => student.id);
        await Promise.all([
          fetchAttendance(studentIds),
          fetchMedicalRecords(studentIds),
        ]);
      }
    }
  };

  const fetchAttendance = async (studentIds: string[]) => {
    if (studentIds.length === 0) return;
    
    const { data, error } = await supabase
      .from('attendance_students')
      .select('*')
      .in('student_id', studentIds)
      .order('attendance_date', { ascending: false })
      .limit(10);

    if (!error) setAttendance(data || []);
  };

  const fetchApplicationNotes = async (applicationIds: string[]) => {
    if (applicationIds.length === 0) return;
    
    const { data, error } = await supabase
      .from('application_notes')
      .select(`
        *,
        users(first_name, last_name)
      `)
      .in('application_id', applicationIds)
      .order('created_at', { ascending: false });

    if (!error) setApplicationNotes(data || []);
  };

  const fetchMedicalRecords = async (studentIds: string[]) => {
    if (studentIds.length === 0) return;

    const { data, error } = await supabase
      .from('student_medical_records')
      .select(`
        *,
        creches(name)
      `)
      .in('student_id', studentIds)
      .order('created_at', { ascending: false });

    if (!error) setMedicalRecords(data || []);
  };

  // Check if child is currently enrolled as a student
  const isChildEnrolledAsStudent = () => {
    return students.length > 0;
  };

  // Get current enrollment (students where child is enrolled)
  const getCurrentEnrollment = () => {
    return students;
  };

  // Check if child is applying to transfer (applying to different creche than current)
  const isApplyingForTransfer = (application: Application) => {
    if (!child?.creche_id) return false;
    return application.creche_id !== child.creche_id;
  };

  // Get applications that are transfers
  const getTransferApplications = () => {
    return applications.filter(app => isApplyingForTransfer(app));
  };

  // Get applications to current creche
  const getCurrentCrecheApplications = () => {
    if (!child?.creche_id) return [];
    return applications.filter(app => app.creche_id === child.creche_id);
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return <CheckCircle size={16} color="#22c55e" />;
      case 'declined':
      case 'rejected':
        return <XCircle size={16} color="#ef4444" />;
      case 'pending':
      case 'new':
        return <Clock size={16} color="#f59e0b" />;
      default:
        return <AlertCircle size={16} color="#6b7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return '#22c55e';
      case 'declined':
      case 'rejected':
        return '#ef4444';
      case 'pending':
      case 'new':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return '#22c55e';
      case 'absent':
        return '#ef4444';
      case 'late':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount || 0);
  };

  const getAttendancePercentage = () => {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    return Math.round((presentCount / attendance.length) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  // Render enrollment status badge
  const renderEnrollmentStatus = () => {
    const enrolled = isChildEnrolledAsStudent();
    const currentCreche = child?.creche;
    
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
    } else {
      return (
        <View style={[styles.enrollmentBadge, { backgroundColor: '#fef3c7' }]}>
          <AlertCircle size={16} color="#f59e0b" />
          <Text style={[styles.enrollmentBadgeText, { color: '#92400e' }]}>
            Not registered at any creche
          </Text>
        </View>
      );
    }
  };

  // Add Finance Section
  const renderFinanceSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Finance</Text>
        <Text style={styles.sectionSubtitle}>
          {invoices.length} invoice(s) • {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0))} total
        </Text>
      </View>
      
      {invoices.length > 0 ? (
        <>
          {/* Summary Stats */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
              <Text style={styles.statNumber}>
                {formatCurrency(invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0))}
              </Text>
              <Text style={styles.statLabel}>Paid</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
              <Text style={styles.statNumber}>
                {formatCurrency(invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + (inv.total_amount || 0), 0))}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
              <Text style={styles.statNumber}>
                {formatCurrency(invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (inv.total_amount || 0), 0))}
              </Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
          </View>

          {/* Invoices List */}
          {invoices.map((invoice) => (
            <Pressable 
              key={invoice.id} 
              style={styles.invoiceCard}
              onPress={() => router.push(`/invoices/${invoice.id}`)}
            >
              <View style={styles.invoiceHeader}>
                <Text style={styles.invoiceTitle}>{invoice.title}</Text>
                <View style={[
                  styles.invoiceStatusBadge,
                  { backgroundColor: 
                    invoice.status === 'paid' ? '#d1fae5' :
                    invoice.status === 'pending' ? '#fef3c7' :
                    '#fee2e2'
                  }
                ]}>
                  <Text style={[
                    styles.invoiceStatusText,
                    { color: 
                      invoice.status === 'paid' ? '#065f46' :
                      invoice.status === 'pending' ? '#92400e' :
                      '#991b1b'
                    }
                  ]}>
                    {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.invoiceDate}>
                {new Date(invoice.created_at).toLocaleDateString()}
              </Text>
              <Text style={styles.invoiceAmount}>
                {formatCurrency(invoice.total_amount || 0)}
              </Text>
              {invoice.creches?.name && (
                <Text style={styles.invoiceCreche}>
                  {invoice.creches.name}
                </Text>
              )}
            </Pressable>
          ))}
        </>
      ) : (
        <View style={styles.emptyState}>
          <FileText size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No invoices found</Text>
        </View>
      )}
    </View>
  );

  // Add Parents Section
  const renderParentsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Parents & Guardians</Text>
        <Text style={styles.sectionSubtitle}>
          {child?.parents?.length || 0} parent(s) linked
        </Text>
      </View>
      
      {child?.parents && child.parents.length > 0 ? (
        child.parents.map((parent) => (
          <View key={parent.id} style={styles.parentCard}>
            <View style={styles.parentAvatar}>
              <Text style={styles.parentAvatarText}>
                {parent.users?.first_name?.charAt(0)}{parent.users?.last_name?.charAt(0)}
              </Text>
            </View>
            <View style={styles.parentInfo}>
              <Text style={styles.parentName}>
                {parent.users?.first_name} {parent.users?.last_name}
              </Text>
              <Text style={styles.parentRelationship}>
                {parent.relationship} {parent.is_verified ? '• Verified' : '• Pending'}
              </Text>
              <Text style={styles.parentContact}>
                {parent.users?.email} • {parent.users?.phone_number}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Users size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No parents linked</Text>
          <Text style={styles.emptySubtext}>
            Share a code to invite other parents
          </Text>
        </View>
      )}
      
      {/* Share Code Section */}
      {child?.share_code && (
        <View style={styles.shareCard}>
          <Text style={styles.shareTitle}>Share Code</Text>
          <Text style={styles.shareCode}>{child.share_code}</Text>
          <Text style={styles.shareDescription}>
            Share this code with other parents to link them to this child
          </Text>
          <Pressable 
            style={styles.copyButton}
            onPress={() => {
              Clipboard.setString(child.share_code);
              Alert.alert('Copied', 'Share code copied to clipboard');
            }}
          >
            <Text style={styles.copyButtonText}>Copy Code</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" />
          </Pressable>
          <Text style={styles.headerTitle}>Child Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading child details...</Text>
        </View>
      </View>
    );
  }

  if (!child) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" />
          </Pressable>
          <Text style={styles.headerTitle}>Child Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Child Not Found</Text>
          <Text style={styles.errorDescription}>
            The child you're looking for doesn't exist or you don't have permission to view it.
          </Text>
        </View>
      </View>
    );
  }

  const renderOverviewSection = () => (
    <View style={styles.section}>
      {/* Hero Section */}
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.avatarContainer}>
            {child.profile_picture_url ? (
              <Image
                source={{ uri: child.profile_picture_url }}
                style={styles.heroAvatar}
              />
            ) : (
              <View style={styles.heroAvatar}>
                <Text style={styles.heroAvatarText}>
                  {child.first_name.charAt(0)}{child.last_name.charAt(0)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>
              {child.first_name} {child.last_name}
            </Text>
            <Text style={styles.heroAge}>
              {calculateAge(child.date_of_birth)} years old • {child.gender}
            </Text>
            <Text style={styles.heroSince}>
              Member since {new Date(child.created_at).getFullYear()}
            </Text>
            {/* Enrollment Status */}
            {renderEnrollmentStatus()}
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>{getCurrentEnrollment().length}</Text>
            <Text style={styles.heroStatLabel}>Active</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>{applications.length}</Text>
            <Text style={styles.heroStatLabel}>Applications</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>{getAttendancePercentage()}%</Text>
            <Text style={styles.heroStatLabel}>Attendance</Text>
          </View>
        </View>
      </View>

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
          <Text style={styles.statNumber}>{getCurrentEnrollment().length}</Text>
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
            <FileText size={20} color="#ffffff" />
          </View>
          <Text style={styles.statNumber}>{applications.length}</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
          <View style={styles.statIconContainer}>
            <BookOpen size={20} color="#ffffff" />
          </View>
          <Text style={styles.statNumber}>{applicationNotes.length}</Text>
          <Text style={styles.statLabel}>Notes</Text>
        </View>
      </View>

      {/* Progress Section - Only if enrolled */}
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

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <Pressable style={styles.actionButton} onPress={() => setActiveSection('applications')}>
            <View style={[styles.actionIcon, { backgroundColor: '#8b5cf6' }]}>
              <FileText size={20} color="#ffffff" />
            </View>
            <Text style={styles.actionText}>Applications</Text>
          </Pressable>
          {isChildEnrolledAsStudent() && (
            <>
              <Pressable style={styles.actionButton} onPress={() => setActiveSection('attendance')}>
                <View style={[styles.actionIcon, { backgroundColor: '#06b6d4' }]}>
                  <CalendarClock size={20} color="#ffffff" />
                </View>
                <Text style={styles.actionText}>Attendance</Text>
              </Pressable>
              <Pressable style={styles.actionButton} onPress={() => setActiveSection('medical')}>
                <View style={[styles.actionIcon, { backgroundColor: '#10b981' }]}>
                  <Heart size={20} color="#ffffff" />
                </View>
                <Text style={styles.actionText}>Medical</Text>
              </Pressable>
              <Pressable style={styles.actionButton} onPress={() => setActiveSection('finance')}>
                <View style={[styles.actionIcon, { backgroundColor: '#f59e0b' }]}>
                  <FileText size={20} color="#ffffff" />
                </View>
                <Text style={styles.actionText}>Finance</Text>
              </Pressable>
            </>
          )}
          <Pressable style={styles.actionButton} onPress={() => setActiveSection('notes')}>
            <View style={[styles.actionIcon, { backgroundColor: '#8b5cf6' }]}>
              <BookOpen size={20} color="#ffffff" />
            </View>
            <Text style={styles.actionText}>Notes</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => setActiveSection('parents')}>
            <View style={[styles.actionIcon, { backgroundColor: '#06b6d4' }]}>
              <Users size={20} color="#ffffff" />
            </View>
            <Text style={styles.actionText}>Parents</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderApplicationsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Applications</Text>
        <Text style={styles.sectionSubtitle}>{applications.length} total applications</Text>
      </View>
      
      {/* Current Registration Info */}
      {child.creche && (
        <View style={styles.currentCrecheInfoCard}>
          <Text style={styles.currentCrecheInfoTitle}>Currently Registered At:</Text>
          <View style={styles.currentCrecheInfoContent}>
            <School size={16} color="#8b5cf6" />
            <Text style={styles.currentCrecheInfoText}>{child.creche.name}</Text>
          </View>
        </View>
      )}

      {applications.length > 0 ? (
        <>
          {/* Transfer Applications */}
          {getTransferApplications().length > 0 && (
            <>
              <Text style={styles.applicationsSubtitle}>Transfer Applications</Text>
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
            </>
          )}

          {/* Applications to Current Creche */}
          {getCurrentCrecheApplications().length > 0 && (
            <>
              <Text style={[styles.applicationsSubtitle, { marginTop: getTransferApplications().length > 0 ? 20 : 0 }]}>
                Applications to Current Creche
              </Text>
              {getCurrentCrecheApplications().map((application) => (
                <Pressable 
                  key={application.id} 
                  style={styles.applicationCard}
                  onPress={() => router.push(`/applications/${application.id}`)}
                >
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
            </>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <FileText size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No applications found</Text>
          {child.creche_id && (
            <Pressable 
              style={styles.applyButton}
              onPress={() => router.push(`/apply/${child.id}`)}
            >
              <Text style={styles.applyButtonText}>Apply to Another Creche</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );

  const renderEnrollmentSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Student Enrollment</Text>
        <Text style={styles.sectionSubtitle}>{getCurrentEnrollment().length} active enrollments</Text>
      </View>
      
      {/* Current Registration Info */}
      {child.creche && (
        <View style={styles.currentCrecheInfoCard}>
          <Text style={styles.currentCrecheInfoTitle}>Currently Registered At:</Text>
          <View style={styles.currentCrecheInfoContent}>
            <School size={16} color="#8b5cf6" />
            <Text style={styles.currentCrecheInfoText}>{child.creche.name}</Text>
          </View>
        </View>
      )}

      {isChildEnrolledAsStudent() ? (
        getCurrentEnrollment().map((student) => (
          <View key={student.id} style={styles.studentCard}>
            <Image 
              source={{ uri: student.creches?.header_image }} 
              style={styles.crecheImage} 
            />
            <View style={styles.studentInfo}>
              <Text style={styles.crecheName}>{student.creches?.name}</Text>
              <Text style={styles.classText}>Class: {student.class || 'Not assigned'}</Text>
              <Text style={styles.addressText}>
                <MapPin size={12} color="#64748b" /> {student.creches?.address}
              </Text>
              <View style={styles.feesContainer}>
                <View style={styles.feesProgress}>
                  <View 
                    style={[
                      styles.feesProgressBar, 
                      { 
                        width: `${student.fees_owed > 0 ? 
                          Math.min((student.fees_paid / student.fees_owed) * 100, 100) : 0}%` 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.feesText}>
                  {formatCurrency(student.fees_paid)} paid / {formatCurrency(student.fees_owed)} owed
                </Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <School size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>Not currently enrolled as a student</Text>
          <Text style={styles.emptySubtext}>
            {child.creche ? 
              `Child is registered at ${child.creche.name} but not enrolled yet.` :
              'Child is not registered at any creche.'
            }
          </Text>
        </View>
      )}
    </View>
  );

  const renderAttendanceSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Attendance</Text>
        <Text style={styles.sectionSubtitle}>{getAttendancePercentage()}% overall attendance</Text>
      </View>
      
      {isChildEnrolledAsStudent() ? (
        <>
          {/* Attendance Summary */}
          <View style={styles.attendanceSummary}>
            <View style={styles.attendanceStat}>
              <Text style={styles.attendanceStatNumber}>
                {attendance.filter(a => a.status === 'Present').length}
              </Text>
              <Text style={styles.attendanceStatLabel}>Present</Text>
            </View>
            <View style={styles.attendanceStat}>
              <Text style={styles.attendanceStatNumber}>
                {attendance.filter(a => a.status === 'Absent').length}
              </Text>
              <Text style={styles.attendanceStatLabel}>Absent</Text>
            </View>
            <View style={styles.attendanceStat}>
              <Text style={styles.attendanceStatNumber}>
                {attendance.filter(a => a.status === 'Late').length}
              </Text>
              <Text style={styles.attendanceStatLabel}>Late</Text>
            </View>
          </View>

          {attendance.length > 0 ? (
            attendance.map((record) => (
              <View key={record.id} style={styles.attendanceCard}>
                <View style={styles.attendanceDate}>
                  <Text style={styles.attendanceDay}>
                    {new Date(record.attendance_date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={styles.attendanceNumber}>
                    {new Date(record.attendance_date).getDate()}
                  </Text>
                </View>
                <View style={styles.attendanceInfo}>
                  <Text style={styles.attendanceMonth}>
                    {new Date(record.attendance_date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: getAttendanceColor(record.status) }
                    ]} />
                    <Text style={[
                      styles.attendanceStatus,
                      { color: getAttendanceColor(record.status) }
                    ]}>
                      {record.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <CalendarClock size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No attendance records</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <CalendarClock size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>Not enrolled as a student</Text>
          <Text style={styles.emptySubtext}>
            Attendance records are only available for enrolled students.
          </Text>
        </View>
      )}
    </View>
  );

  const renderMedicalSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Medical Records</Text>
        <Text style={styles.sectionSubtitle}>{medicalRecords.length} medical records</Text>
      </View>
      
      {isChildEnrolledAsStudent() ? (
        medicalRecords.length > 0 ? (
          medicalRecords.map((record) => (
            <View key={record.id} style={styles.medicalCard}>
              <View style={styles.medicalHeader}>
                <Stethoscope size={20} color="#374151" />
                <Text style={styles.medicalCreche}>{record.creches?.name}</Text>
              </View>
              <View style={styles.medicalGrid}>
                <View style={styles.medicalInfo}>
                  <Text style={styles.medicalLabel}>Immunization Status:</Text>
                  <Text style={styles.medicalValue}>{record.immunization_status}</Text>
                </View>
                {record.allergies && (
                  <View style={styles.medicalInfo}>
                    <Text style={styles.medicalLabel}>Allergies:</Text>
                    <Text style={styles.medicalValue}>{record.allergies}</Text>
                  </View>
                )}
                {record.last_checkup && (
                  <View style={styles.medicalInfo}>
                    <Text style={styles.medicalLabel}>Last Checkup:</Text>
                    <Text style={styles.medicalValue}>
                      {new Date(record.last_checkup).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                {record.next_checkup && (
                  <View style={styles.medicalInfo}>
                    <Text style={styles.medicalLabel}>Next Checkup:</Text>
                    <Text style={styles.medicalValue}>
                      {new Date(record.next_checkup).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
              {record.medical_notes && (
                <View style={styles.medicalNotes}>
                  <Text style={styles.medicalLabel}>Notes:</Text>
                  <Text style={styles.medicalValue}>{record.medical_notes}</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Heart size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No medical records</Text>
          </View>
        )
      ) : (
        <View style={styles.emptyState}>
          <Heart size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>Not enrolled as a student</Text>
          <Text style={styles.emptySubtext}>
            Medical records are only available for enrolled students.
          </Text>
        </View>
      )}
    </View>
  );

  const renderNotesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Application Notes</Text>
        <Text style={styles.sectionSubtitle}>{applicationNotes.length} notes</Text>
      </View>
      {applicationNotes.length > 0 ? (
        applicationNotes.map((note) => (
          <View key={note.id} style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <View style={styles.noteAuthorInfo}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorAvatarText}>
                    {note.users.first_name.charAt(0)}{note.users.last_name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.noteAuthor}>
                  {note.users.first_name} {note.users.last_name}
                </Text>
              </View>
              <Text style={styles.noteDate}>
                {new Date(note.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.noteText}>{note.note}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <BookOpen size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No notes available</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {child.first_name}'s Dashboard
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Navigation Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        <View style={styles.tabs}>
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'applications', label: 'Applications', icon: FileText },
            { key: 'enrollment', label: 'Enrollment', icon: School },
            { key: 'attendance', label: 'Attendance', icon: CalendarClock },
            { key: 'medical', label: 'Medical', icon: Heart },
            { key: 'finance', label: 'Finance', icon: FileText },
            { key: 'parents', label: 'Parents', icon: Users },
            { key: 'notes', label: 'Notes', icon: BookOpen },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.tab,
                  activeSection === tab.key && styles.activeTab,
                ]}
                onPress={() => setActiveSection(tab.key)}
              >
                <IconComponent size={16} color={activeSection === tab.key ? '#ffffff' : '#6b7280'} />
                <Text style={[
                  styles.tabText,
                  activeSection === tab.key && styles.activeTabText,
                ]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.contentContainer}
      >
        {activeSection === 'overview' && renderOverviewSection()}
        {activeSection === 'applications' && renderApplicationsSection()}
        {activeSection === 'enrollment' && renderEnrollmentSection()}
        {activeSection === 'attendance' && renderAttendanceSection()}
        {activeSection === 'medical' && renderMedicalSection()}
        {activeSection === 'finance' && renderFinanceSection()}
        {activeSection === 'parents' && renderParentsSection()}
        {activeSection === 'notes' && renderNotesSection()}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

// Add these new styles to your existing styles object:
  
  // Keep all your existing styles below...
const styles = StyleSheet.create({
  container: {
  
    backgroundColor: '#f8fafc',
  },
    content: {
        flex: 1,
  },
    contentContainer: {
        flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#8b5cf6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },

    invoiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  invoiceStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  invoiceStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  invoiceCreche: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  activeTab: {
    backgroundColor: '#8b5cf6',
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  applicationsSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
  },
  // Hero Section
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  heroAge: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 2,
  },
  heroSince: {
    fontSize: 14,
    color: '#94a3b8',
  },
  enrollmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  enrollmentBadgeText: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '600',
    marginLeft: 6,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  // Current Creche Card
  currentCrecheCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  currentCrecheHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentCrecheTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    marginRight: 16,
  },
  currentCrecheInfo: {
    flex: 1,
  },
  currentCrecheName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  currentCrecheAddress: {
    fontSize: 14,
    color: '#64748b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentCrecheNote: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  // Current Creche Info Card (for other sections)
  currentCrecheInfoCard: {
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  currentCrecheInfoTitle: {
    fontSize: 14,
    color: '#3730a3',
    fontWeight: '600',
    marginBottom: 8,
  },
  currentCrecheInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentCrecheInfoText: {
    fontSize: 16,
    color: '#3730a3',
    fontWeight: 'bold',
  },
  // Transfer Section
  transferSection: {
    marginBottom: 20,
  },
  transferBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  transferBadgeText: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },

  // Add to your styles
parentCard: {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
  flexDirection: 'row',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
},
parentAvatar: {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: '#8b5cf6',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 16,
},
parentAvatarText: {
  color: '#ffffff',
  fontSize: 18,
  fontWeight: 'bold',
},
parentInfo: {
  flex: 1,
},
parentName: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#1e293b',
  marginBottom: 4,
},
parentRelationship: {
  fontSize: 14,
  color: '#64748b',
  marginBottom: 2,
},
parentContact: {
  fontSize: 12,
  color: '#94a3b8',
},
shareCard: {
  backgroundColor: '#f0f9ff',
  borderRadius: 16,
  padding: 20,
  marginTop: 20,
  alignItems: 'center',
},
shareTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#0369a1',
  marginBottom: 8,
},
shareCode: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#0c4a6e',
  marginBottom: 12,
  letterSpacing: 2,
},
shareDescription: {
  fontSize: 14,
  color: '#64748b',
  textAlign: 'center',
  marginBottom: 16,
  lineHeight: 20,
},
copyButton: {
  backgroundColor: '#0ea5e9',
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 8,
},
copyButtonText: {
  color: '#ffffff',
  fontSize: 14,
  fontWeight: '600',
},
  statCard: {
    flex: 1,
    minWidth: (screenWidth - 52) / 2,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    fontWeight: '600',
  },
  // Progress Section
  progressSection: {
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e2e8f0',
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
    marginBottom: 20,
  },
  medicalSummaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medicalSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicalSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  medicalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicalText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
  },
  // Quick Actions
  quickActions: {
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    alignItems: 'center',
    width: (screenWidth - 64) / 2,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Application Cards
  applicationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  crecheImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 12,
  },
  applicationInfo: {
    flex: 1,
  },
  studentInfo: {
    flex: 1,
  },
  crecheName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  applicationDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  classText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: '#64748b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  feesContainer: {
    marginTop: 8,
  },
  feesProgress: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  feesProgressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  feesText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  // Attendance
  attendanceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  attendanceStat: {
    alignItems: 'center',
  },
  attendanceStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  attendanceStatLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  attendanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  attendanceDate: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  attendanceDay: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  attendanceNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceMonth: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
    fontWeight: '600',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  attendanceStatus: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  // Medical Cards
  medicalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medicalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicalCreche: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  medicalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  medicalInfo: {
    flex: 1,
    minWidth: '45%',
  },
  medicalLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  medicalValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  medicalNotes: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  // Notes
  noteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  authorAvatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  noteDate: {
    fontSize: 12,
    color: '#64748b',
  },
  noteText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  applyButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});