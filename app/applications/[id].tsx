import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  CircleCheck as CheckCircle,
  Circle as XCircle,
  CircleAlert as AlertCircle,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Users,
  Home,
  Edit,
  Trash2,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Application {
  id: string;
  application_status: string;
  created_at: string;
  submitted_at: string;
  parent_name: string;
  parent_phone_number: string;
  parent_email: string;
  parent_whatsapp: string;
  parent_address: string;
  message: string;
  source: string;
  number_of_children: number;
  lifecycle_stage: string;
  user_id: string;
  creche_id: string;
  child_id: string;
  creches: {
    name: string;
    header_image: string;
    address: string;
    email: string;
    phone_number: string;
    description: string;
  };
  children: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    special_needs: string;
    allergies: string;
    additional_notes: string;
  };
}

export default function ApplicationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          creches(*),
          children(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application:', error);
      Alert.alert('Error', 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return <CheckCircle size={24} color="#22c55e" />;
      case 'declined':
      case 'rejected':
        return <XCircle size={24} color="#ef4444" />;
      case 'pending':
      case 'new':
        return <Clock size={24} color="#f59e0b" />;
      default:
        return <AlertCircle size={24} color="#6b7280" />;
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

  const getStatusBackgroundColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return '#dcfce7';
      case 'declined':
      case 'rejected':
        return '#fef2f2';
      case 'pending':
      case 'new':
        return '#fefce8';
      default:
        return '#f3f4f6';
    }
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWhatsApp = (phoneNumber: string) => {
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}`;
    Linking.openURL(whatsappUrl);
  };

  const handleDeleteApplication = async () => {
    Alert.alert(
      'Delete Application',
      'Are you sure you want to delete this application? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const { error } = await supabase
                .from('applications')
                .delete()
                .eq('id', id);

              if (error) throw error;
              
              Alert.alert('Success', 'Application deleted successfully');
              router.back();
            } catch (error) {
              console.error('Error deleting application:', error);
              Alert.alert('Error', 'Failed to delete application');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleWithdrawApplication = async () => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              const { error } = await supabase
                .from('applications')
                .update({ 
                  application_status: 'withdrawn',
                  updated_at: new Date().toISOString()
                })
                .eq('id', id);

              if (error) throw error;
              
              Alert.alert('Success', 'Application withdrawn successfully');
              fetchApplication(); // Refresh data
            } catch (error) {
              console.error('Error withdrawing application:', error);
              Alert.alert('Error', 'Failed to withdraw application');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const canEditApplication = () => {
    if (!application) return false;
    const status = application.application_status?.toLowerCase();
    return status === 'new' || status === 'pending';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <Text style={styles.headerTitle}>Application Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#bd84f6" />
          <Text style={styles.loadingText}>Loading application details...</Text>
        </View>
      </View>
    );
  }

  if (!application) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <Text style={styles.headerTitle}>Application Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Application Not Found</Text>
          <Text style={styles.errorDescription}>
            The application you're looking for doesn't exist or you don't have permission to view it.
          </Text>
          <Pressable style={styles.backButtonLarge} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Application Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[
          styles.statusBanner,
          { backgroundColor: getStatusBackgroundColor(application.application_status) }
        ]}>
          <View style={styles.statusContent}>
            {getStatusIcon(application.application_status)}
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusLabel}>Application Status</Text>
              <Text style={[
                styles.statusValue,
                { color: getStatusColor(application.application_status) }
              ]}>
                {application.application_status || 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Creche Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Creche Information</Text>
          <View style={styles.crecheCard}>
            <Image 
              source={{ uri: application.creches?.header_image || 'https://crechespots.co.za/wp-content/uploads/2025/09/cropped-cropped-brand.png' }} 
              style={styles.crecheImage} 
            />
            <View style={styles.crecheInfo}>
              <Text style={styles.crecheName}>{application.creches?.name}</Text>
              <Text style={styles.crecheAddress}>
                <MapPin size={14} color="#6b7280" /> {application.creches?.address}
              </Text>
              {application.creches?.description && (
                <Text style={styles.crecheDescription} numberOfLines={2}>
                  {application.creches.description}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Child Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Child Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <User size={18} color="#374151" />
              <Text style={styles.infoLabel}>Full Name:</Text>
              <Text style={styles.infoValue}>
                {application.children?.first_name} {application.children?.last_name}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Calendar size={18} color="#374151" />
              <Text style={styles.infoLabel}>Date of Birth:</Text>
              <Text style={styles.infoValue}>
                {new Date(application.children?.date_of_birth).toLocaleDateString()} 
                ({calculateAge(application.children?.date_of_birth)} years old)
              </Text>
            </View>
            {application.children?.special_needs && (
              <View style={styles.infoRow}>
                <AlertCircle size={18} color="#374151" />
                <Text style={styles.infoLabel}>Special Needs:</Text>
                <Text style={styles.infoValue}>{application.children.special_needs}</Text>
              </View>
            )}
            {application.children?.allergies && (
              <View style={styles.infoRow}>
                <AlertCircle size={18} color="#374151" />
                <Text style={styles.infoLabel}>Allergies:</Text>
                <Text style={styles.infoValue}>{application.children.allergies}</Text>
              </View>
            )}
            {application.children?.additional_notes && (
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>Additional Notes:</Text>
                <Text style={styles.infoValue}>{application.children.additional_notes}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Parent Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parent Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <User size={18} color="#374151" />
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{application.parent_name}</Text>
            </View>
            <Pressable 
              style={styles.infoRow} 
              onPress={() => handleCall(application.parent_phone_number)}
            >
              <Phone size={18} color="#374151" />
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={[styles.infoValue, styles.link]}>{application.parent_phone_number}</Text>
            </Pressable>
            <Pressable 
              style={styles.infoRow} 
              onPress={() => handleEmail(application.parent_email)}
            >
              <Mail size={18} color="#374151" />
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={[styles.infoValue, styles.link]}>{application.parent_email}</Text>
            </Pressable>
            {application.parent_whatsapp && (
              <Pressable 
                style={styles.infoRow} 
                onPress={() => handleWhatsApp(application.parent_whatsapp)}
              >
                <MessageCircle size={18} color="#374151" />
                <Text style={styles.infoLabel}>WhatsApp:</Text>
                <Text style={[styles.infoValue, styles.link]}>{application.parent_whatsapp}</Text>
              </Pressable>
            )}
            {application.parent_address && (
              <View style={styles.infoRow}>
                <Home size={18} color="#374151" />
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{application.parent_address}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Application Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Calendar size={18} color="#374151" />
              <Text style={styles.infoLabel}>Applied On:</Text>
              <Text style={styles.infoValue}>{formatDate(application.created_at)}</Text>
            </View>
            {application.submitted_at && (
              <View style={styles.infoRow}>
                <Calendar size={18} color="#374151" />
                <Text style={styles.infoLabel}>Submitted On:</Text>
                <Text style={styles.infoValue}>{formatDate(application.submitted_at)}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Users size={18} color="#374151" />
              <Text style={styles.infoLabel}>Number of Children:</Text>
              <Text style={styles.infoValue}>{application.number_of_children || 1}</Text>
            </View>
            {application.source && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Source:</Text>
                <Text style={styles.infoValue}>{application.source}</Text>
              </View>
            )}
            {application.lifecycle_stage && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Lifecycle Stage:</Text>
                <Text style={styles.infoValue}>{application.lifecycle_stage}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Message */}
        {application.message && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Message</Text>
            <View style={styles.messageCard}>
              <MessageCircle size={20} color="#6b7280" />
              <Text style={styles.messageText}>{application.message}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {user?.id === application.user_id && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionsContainer}>
              {canEditApplication() && (
                <Pressable 
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => router.push(`/applications/${application.id}/edit`)}
                >
                  <Edit size={18} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Edit Application</Text>
                </Pressable>
              )}
              
              {canEditApplication() && (
                <Pressable 
                  style={[styles.actionButton, styles.withdrawButton]}
                  onPress={handleWithdrawApplication}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <XCircle size={18} color="#ffffff" />
                  )}
                  <Text style={styles.actionButtonText}>
                    {updating ? 'Withdrawing...' : 'Withdraw Application'}
                  </Text>
                </Pressable>
              )}

              <Pressable 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeleteApplication}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Trash2 size={18} color="#ffffff" />
                )}
                <Text style={styles.actionButtonText}>
                  {deleting ? 'Deleting...' : 'Delete Application'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Contact Creche */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Creche</Text>
          <View style={styles.contactButtons}>
            {application.creches?.phone_number && (
              <Pressable 
                style={[styles.contactButton, styles.callButton]}
                onPress={() => handleCall(application.creches.phone_number)}
              >
                <Phone size={18} color="#ffffff" />
                <Text style={styles.contactButtonText}>Call Creche</Text>
              </Pressable>
            )}
            {application.creches?.email && (
              <Pressable 
                style={[styles.contactButton, styles.emailButton]}
                onPress={() => handleEmail(application.creches.email)}
              >
                <Mail size={18} color="#ffffff" />
                <Text style={styles.contactButtonText}>Email Creche</Text>
              </Pressable>
            )}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    marginBottom: 24,
  },
  backButtonLarge: {
    backgroundColor: '#bd84f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBanner: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextContainer: {
    marginLeft: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  crecheCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
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
    borderRadius: 30,
    marginRight: 12,
  },
  crecheInfo: {
    flex: 1,
  },
  crecheName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  crecheAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  crecheDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoColumn: {
    marginBottom: 12,
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
  link: {
    color: '#bd84f6',
    textDecorationLine: 'underline',
  },
  messageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  messageText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    flex: 1,
    marginLeft: 8,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#bd84f6',
  },
  withdrawButton: {
    backgroundColor: '#f59e0b',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButtons: {
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  callButton: {
    backgroundColor: '#22c55e',
  },
  emailButton: {
    backgroundColor: '#3b82f6',
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});