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
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Baby,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Stethoscope,
  BookOpen,
  TrendingUp,
  CreditCard,
  Users,
  School,
  Heart,
  Pill,
  CalendarClock,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

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
}

interface Application {
  id: string;
  application_status: string;
  created_at: string;
  parent_name: string;
  parent_phone_number: string;
  parent_email: string;
  message: string;
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
  application_id: string;
  class: string;
  fees_owed: number;
  fees_paid: number;
  profile_picture: string;
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
  creches: {
    name: string;
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

      // Fetch child details
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('id', id)
        .single();

      if (childError) throw childError;
      setChild(childData);

      // Fetch all related data in parallel
      await Promise.all([
        fetchApplications(),
        fetchStudents(),
        fetchAttendance(),
        fetchApplicationNotes(),
        fetchMedicalRecords(),
      ]);

    } catch (error) {
      console.error('Error fetching child data:', error);
      Alert.alert('Error', 'Failed to load child details');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        creches(*)
      `)
      .eq('child_id', id)
      .order('created_at', { ascending: false });

    if (!error) setApplications(data || []);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        creches(name, header_image, address)
      `)
      .eq('application_id', applications[0]?.id) // Assuming one application per student
      .order('created_at', { ascending: false });

    if (!error) setStudents(data || []);
  };

  const fetchAttendance = async () => {
    if (students.length === 0) return;

    const studentIds = students.map(student => student.id);
    const { data, error } = await supabase
      .from('attendance_students')
      .select('*')
      .in('student_id', studentIds)
      .order('attendance_date', { ascending: false })
      .limit(10); // Last 10 attendance records

    if (!error) setAttendance(data || []);
  };

  const fetchApplicationNotes = async () => {
    const applicationIds = applications.map(app => app.id);
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

  const fetchMedicalRecords = async () => {
    if (students.length === 0) return;

    const studentIds = students.map(student => student.id);
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <Text style={styles.headerTitle}>Child Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#bd84f6" />
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
            <ArrowLeft size={24} color="#374151" />
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
      <Text style={styles.sectionTitle}>Overview</Text>
      
      {/* Child Basic Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Baby size={18} color="#374151" />
          <Text style={styles.infoLabel}>Full Name:</Text>
          <Text style={styles.infoValue}>
            {child.first_name} {child.last_name}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar size={18} color="#374151" />
          <Text style={styles.infoLabel}>Date of Birth:</Text>
          <Text style={styles.infoValue}>
            {new Date(child.date_of_birth).toLocaleDateString()} 
            ({calculateAge(child.date_of_birth)} years old)
          </Text>
        </View>
        {child.gender && (
          <View style={styles.infoRow}>
            <User size={18} color="#374151" />
            <Text style={styles.infoLabel}>Gender:</Text>
            <Text style={styles.infoValue}>{child.gender}</Text>
          </View>
        )}
      </View>

      {/* Medical Summary */}
      {(child.allergies || child.special_needs || child.medical_conditions) && (
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Medical Summary</Text>
          {child.allergies && (
            <View style={styles.infoRow}>
              <AlertCircle size={18} color="#ef4444" />
              <Text style={styles.infoLabel}>Allergies:</Text>
              <Text style={styles.infoValue}>{child.allergies}</Text>
            </View>
          )}
          {child.special_needs && (
            <View style={styles.infoRow}>
              <Heart size={18} color="#3b82f6" />
              <Text style={styles.infoLabel}>Special Needs:</Text>
              <Text style={styles.infoValue}>{child.special_needs}</Text>
            </View>
          )}
          {child.medical_conditions && (
            <View style={styles.infoRow}>
              <Pill size={18} color="#8b5cf6" />
              <Text style={styles.infoLabel}>Medical Conditions:</Text>
              <Text style={styles.infoValue}>{child.medical_conditions}</Text>
            </View>
          )}
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{applications.length}</Text>
          <Text style={styles.statLabel}>Applications</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{students.length}</Text>
          <Text style={styles.statLabel}>Active Enrollments</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {attendance.filter(a => a.status === 'Present').length}
          </Text>
          <Text style={styles.statLabel}>Days Present</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{applicationNotes.length}</Text>
          <Text style={styles.statLabel}>Notes</Text>
        </View>
      </View>
    </View>
  );

  const renderApplicationsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Applications</Text>
      {applications.length > 0 ? (
        applications.map((application) => (
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
        ))
      ) : (
        <View style={styles.emptyState}>
          <FileText size={32} color="#d1d5db" />
          <Text style={styles.emptyText}>No applications found</Text>
        </View>
      )}
    </View>
  );

  const renderEnrollmentSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Current Enrollment</Text>
      {students.length > 0 ? (
        students.map((student) => (
          <View key={student.id} style={styles.studentCard}>
            <Image 
              source={{ uri: student.creches?.header_image }} 
              style={styles.crecheImage} 
            />
            <View style={styles.studentInfo}>
              <Text style={styles.crecheName}>{student.creches?.name}</Text>
              <Text style={styles.classText}>Class: {student.class || 'Not assigned'}</Text>
              <View style={styles.feesContainer}>
                <Text style={styles.feesText}>
                  Fees: {formatCurrency(student.fees_paid)} paid / {formatCurrency(student.fees_owed)} owed
                </Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <School size={32} color="#d1d5db" />
          <Text style={styles.emptyText}>Not currently enrolled</Text>
        </View>
      )}
    </View>
  );

  const renderAttendanceSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Attendance</Text>
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
          <CalendarClock size={32} color="#d1d5db" />
          <Text style={styles.emptyText}>No attendance records</Text>
        </View>
      )}
    </View>
  );

  const renderMedicalSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Medical Records</Text>
      {medicalRecords.length > 0 ? (
        medicalRecords.map((record) => (
          <View key={record.id} style={styles.medicalCard}>
            <View style={styles.medicalHeader}>
              <Stethoscope size={20} color="#374151" />
              <Text style={styles.medicalCreche}>{record.creches?.name}</Text>
            </View>
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
            {record.medical_notes && (
              <View style={styles.medicalInfo}>
                <Text style={styles.medicalLabel}>Notes:</Text>
                <Text style={styles.medicalValue}>{record.medical_notes}</Text>
              </View>
            )}
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Heart size={32} color="#d1d5db" />
          <Text style={styles.emptyText}>No medical records</Text>
        </View>
      )}
    </View>
  );

  const renderNotesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Application Notes</Text>
      {applicationNotes.length > 0 ? (
        applicationNotes.map((note) => (
          <View key={note.id} style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteAuthor}>
                {note.users.first_name} {note.users.last_name}
              </Text>
              <Text style={styles.noteDate}>
                {new Date(note.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.noteText}>{note.note}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <BookOpen size={32} color="#d1d5db" />
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
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {child.first_name} {child.last_name}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Navigation Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        <View style={styles.tabs}>
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'applications', label: 'Applications', icon: FileText },
            { key: 'enrollment', label: 'Enrollment', icon: School },
            { key: 'attendance', label: 'Attendance', icon: CalendarClock },
            { key: 'medical', label: 'Medical', icon: Heart },
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
      <ScrollView style={styles.content}>
        {activeSection === 'overview' && renderOverviewSection()}
        {activeSection === 'applications' && renderApplicationsSection()}
        {activeSection === 'enrollment' && renderEnrollmentSection()}
        {activeSection === 'attendance' && renderAttendanceSection()}
        {activeSection === 'medical' && renderMedicalSection()}
        {activeSection === 'notes' && renderNotesSection()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4fcfe',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  placeholder: {
    width: 40,
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    backgroundColor: '#f9fafb',
  },
  activeTab: {
    backgroundColor: '#bd84f6',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
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
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#bd84f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  applicationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
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
  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  applicationInfo: {
    flex: 1,
  },
  studentInfo: {
    flex: 1,
  },
  crecheName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  applicationDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  classText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
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
    marginTop: 4,
  },
  feesText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  attendanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
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
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  attendanceNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceMonth: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  attendanceStatus: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  medicalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medicalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicalCreche: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginLeft: 8,
  },
  medicalInfo: {
    marginBottom: 8,
  },
  medicalLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 2,
  },
  medicalValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  noteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  noteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  noteDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  noteText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
});