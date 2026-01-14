import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Child,
  Application,
  Student,
  AttendanceRecord,
  ApplicationNote,
  MedicalRecord,
  Invoice,
  ChildInvite
} from './types';
import Header from './components/Header';
import TabsNavigation from './components/TabsNavigation';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import OverviewSection from './sections/OverviewSection';
import ApplicationsSection from './sections/ApplicationsSection';
import EnrollmentSection from './sections/EnrollmentSection';
import AttendanceSection from './sections/AttendanceSection';
import MedicalSection from './sections/MedicalSection';
import FinanceSection from './sections/FinanceSection';
import ParentsSection from './sections/ParentsSection';
import NotesSection from './sections/NotesSection';
import { sharedStyles } from './styles';

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
  const [invites, setInvites] = useState<ChildInvite[]>([]);
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
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('User not authenticated');

      await Promise.all([
        fetchChild(id as string, currentUser.id),
        fetchApplications(id as string),
        fetchStudents(id as string),
        fetchInvoices(id as string),
        fetchChildParents(id as string),
        fetchChildInvites(id as string),
      ]);
    } catch (error: any) {
      console.error('Error fetching child data:', error);
      Alert.alert('Error', error.message || 'Failed to load child details');
    } finally {
      setLoading(false);
    }
  };

  const fetchChild = async (childId: string, userId: string) => {
    const { data: childAccess, error: accessError } = await supabase
      .from('children')
      .select(`
        *,
        creche:creches(id, name, header_image, address),
        child_parents!inner(
          relationship,
          permissions,
          is_verified
        )
      `)
      .eq('id', childId)
      .or(`user_id.eq.${userId},child_parents.user_id.eq.${userId},child_parents.is_verified.eq.true`)
      .single();

    if (accessError) {
      const { data: ownedChild, error: ownedError } = await supabase
        .from('children')
        .select(`
          *,
          creche:creches(id, name, header_image, address)
        `)
        .eq('id', childId)
        .eq('user_id', userId)
        .single();

      if (ownedError) {
        throw new Error('You do not have access to this child');
      }

      setChild({
        ...ownedChild,
        relationship: 'owner' as const,
        permissions: { edit: true, view: true, manage: true }
      });
    } else {
      const parentRecord = childAccess.child_parents[0];
      setChild({
        ...childAccess,
        relationship: parentRecord.relationship || 'parent',
        permissions: parentRecord.permissions || { edit: false, view: true, manage: false }
      });
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
      setChild(prev => prev ? { ...prev, parents: data || [] } : null);
    } catch (error) {
      console.error('Error fetching child parents:', error);
    }
  };

  const fetchChildInvites = async (childId: string) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data, error } = await supabase
        .from('child_invites')
        .select(`
          *,
          inviter:users!child_invites_inviter_id_fkey(first_name, last_name),
          invitee:users!child_invites_invitee_user_id_fkey(first_name, last_name)
        `)
        .eq('child_id', childId)
        .or(`inviter_id.eq.${currentUser.id},invitee_user_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Error fetching child invites:', error);
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
      if (data && data.length > 0) {
        const applicationIds = data.map(app => app.id);
        await fetchApplicationNotes(applicationIds);
      }
    }
  };

  const fetchStudents = async (childId: string) => {
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

  if (loading) {
    return <LoadingState />;
  }

  if (!child) {
    return <ErrorState onBack={() => router.back()} />;
  }

  const renderSection = () => {
    const sections = {
      overview: (
        <OverviewSection
          child={child}
          applications={applications}
          students={students}
          attendance={attendance}
          invites={invites}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          getAttendancePercentage={getAttendancePercentage}
          calculateAge={calculateAge}
          formatCurrency={formatCurrency}
          getProgressColor={getProgressColor}
          router={router}
          id={id as string}
        />
      ),
      applications: (
        <ApplicationsSection
          child={child}
          applications={applications}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          router={router}
        />
      ),
      enrollment: (
        <EnrollmentSection
          child={child}
          students={students}
          formatCurrency={formatCurrency}
        />
      ),
      attendance: (
        <AttendanceSection
          isChildEnrolledAsStudent={students.length > 0}
          attendance={attendance}
          getAttendancePercentage={getAttendancePercentage}
          getAttendanceColor={getAttendanceColor}
        />
      ),
      medical: (
        <MedicalSection
          child={child}
          isChildEnrolledAsStudent={students.length > 0}
          medicalRecords={medicalRecords}
        />
      ),
      finance: (
        <FinanceSection
          invoices={invoices}
          formatCurrency={formatCurrency}
          router={router}
        />
      ),
      parents: (
        <ParentsSection
          child={child}
          invites={invites}
          fetchChildInvites={() => fetchChildInvites(id as string)}
          router={router}
          id={id as string}
        />
      ),
      notes: (
        <NotesSection
          applicationNotes={applicationNotes}
        />
      ),
    };

    return sections[activeSection as keyof typeof sections] || null;
  };

  return (
    <View style={sharedStyles.container}>
      <Header
        child={child}
        onBack={() => router.back()}
        onInviteParent={() => router.push(`/children/${id}/share`)}
      />
      
      <TabsNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <ScrollView
        style={sharedStyles.content}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={sharedStyles.contentContainer}
      >
        {renderSection()}
        <View style={sharedStyles.bottomPadding} />
      </ScrollView>
    </View>
  );
}