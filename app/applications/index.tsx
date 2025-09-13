import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Clock, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, FileText, Calendar } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface Application {
  id: string;
  application_status: string;
  created_at: string;
  parent_name: string;
  parent_phone_number: string;
  parent_email: string;
  message: string;
  creches: {
    name: string;
    header_image: string;
    address: string;
  };
  children: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
  };
}

export default function ApplicationsScreen() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          creches(name, header_image, address),
          children(first_name, last_name, date_of_birth)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      Alert.alert('Error', 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return <CheckCircle size={20} color="#22c55e" />;
      case 'declined':
      case 'rejected':
        return <XCircle size={20} color="#ef4444" />;
      case 'pending':
      case 'new':
        return <Clock size={20} color="#f59e0b" />;
      default:
        return <AlertCircle size={20} color="#6b7280" />;
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

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.application_status?.toLowerCase() === filter;
  });

  const renderApplicationCard = (application: Application) => (
    <Pressable 
      key={application.id} 
      style={styles.applicationCard}
      onPress={() => router.push(`/applications/${application.id}`)}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: application.creches?.header_image || 'https://crechespots.co.za/wp-content/uploads/2025/09/cropped-cropped-brand.png' }} 
          style={styles.crecheImage} 
        />
        <View style={styles.headerInfo}>
          <Text style={styles.crecheName}>{application.creches?.name}</Text>
          <Text style={styles.childName}>
            For: {application.children?.first_name} {application.children?.last_name}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.application_status) }]}>
          {getStatusIcon(application.application_status)}
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[styles.statusText, { color: getStatusColor(application.application_status) }]}>
            {application.application_status || 'Pending'}
          </Text>
        </View>

        <View style={styles.dateRow}>
          <Calendar size={14} color="#6b7280" />
          <Text style={styles.dateText}>
            Applied: {new Date(application.created_at).toLocaleDateString()}
          </Text>
        </View>

        {application.message && (
          <Text style={styles.messagePreview} numberOfLines={2}>
            "{application.message}"
          </Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>My Applications</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterTabs}>
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Approved' },
              { key: 'declined', label: 'Declined' },
            ].map((tab) => (
              <Pressable
                key={tab.key}
                style={[
                  styles.filterTab,
                  filter === tab.key && styles.activeFilterTab,
                ]}
                onPress={() => setFilter(tab.key)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filter === tab.key && styles.activeFilterTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading applications...</Text>
          </View>
        ) : filteredApplications.length > 0 ? (
          <View style={styles.applicationsContainer}>
            {filteredApplications.map(renderApplicationCard)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <FileText size={48} color="#d1d5db" />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
            </Text>
            <Text style={styles.emptyDescription}>
              {filter === 'all' 
                ? 'Start exploring creches and submit your first application'
                : `You don't have any ${filter} applications at the moment`
              }
            </Text>
            {filter === 'all' && (
              <Pressable 
                style={styles.exploreButton}
                onPress={() => router.push('/search')}
              >
                <Text style={styles.exploreButtonText}>Explore Creches</Text>
              </Pressable>
            )}
          </View>
        )}
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
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterTab: {
    backgroundColor: '#bd4ab5',
    borderColor: '#bd4ab5',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#ffffff',
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
  },
  applicationsContainer: {
    gap: 16,
  },
  applicationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  crecheImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  crecheName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  childName: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  messagePreview: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#bd4ab5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});