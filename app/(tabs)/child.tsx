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
import { ArrowLeft, Plus, CreditCard as Edit3, Calendar, User } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  profile_picture_url: string;
  created_at: string;
}

const ChildCardSkeleton = () => (
  <View style={[styles.childCard, styles.skeletonCard]}>
    <View style={[styles.childAvatar, styles.skeletonAvatar]} />
    <View style={styles.childInfo}>
      <View style={[styles.skeletonText, { width: '60%', height: 20, marginBottom: 8 }]} />
      <View style={styles.childDetails}>
        <View style={[styles.skeletonText, { width: 80, height: 16 }]} />
        <View style={[styles.skeletonText, { width: 60, height: 16 }]} />
      </View>
      <View style={[styles.skeletonText, { width: '40%', height: 14, marginTop: 4 }]} />
    </View>
    <View style={[styles.editButton, styles.skeletonButton]} />
  </View>
);

export default function ChildrenScreen() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Error fetching children:', error);
      Alert.alert('Error', 'Failed to load children');
    } finally {
      setLoading(false);
    }
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const renderChildCard = (child: Child) => (
    <Pressable 
      key={child.id} 
      style={styles.childCard}
      onPress={() => router.push(`/children/${child.id}`)}
    >
      <View style={styles.childAvatar}>
        {child.profile_picture_url ? (
          <Image source={{ uri: child.profile_picture_url }} style={styles.childAvatarImage} />
        ) : (
          <Text style={styles.childAvatarText}>
            {getInitials(child.first_name, child.last_name)}
          </Text>
        )}
      </View>
      
      <View style={styles.childInfo}>
        <Text style={styles.childName}>
          {child.first_name} {child.last_name}
        </Text>
        <View style={styles.childDetails}>
          <View style={styles.detailRow}>
            <Calendar size={14} color="#6b7280" />
            <Text style={styles.detailText}>
              {calculateAge(child.date_of_birth)} years old
            </Text>
          </View>
          <View style={styles.detailRow}>
            <User size={14} color="#6b7280" />
            <Text style={styles.detailText}>{child.gender}</Text>
          </View>
        </View>
        <Text style={styles.birthDate}>
          Born: {new Date(child.date_of_birth).toLocaleDateString()}
        </Text>
      </View>
      
      <Pressable 
        style={styles.editButton}
        onPress={(e) => {
          e.stopPropagation();
          router.push(`/children/${child.id}/edit`);
        }}
      >
        <Edit3 size={16} color="#bd4ab5" />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>My Children</Text>
        <Pressable 
          style={styles.addButton}
          onPress={() => router.push('/children/add')}
        >
          <Plus size={24} color="#bd4ab5" />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.childrenContainer}>
            <ChildCardSkeleton />
            <ChildCardSkeleton />
            <ChildCardSkeleton />
          </View>
        ) : children.length > 0 ? (
          <View style={styles.childrenContainer}>
            {children.map(renderChildCard)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <User size={48} color="#d1d5db" />
            </View>
            <Text style={styles.emptyTitle}>No children added yet</Text>
            <Text style={styles.emptyDescription}>
              Add your children's profiles to start applying to creches
            </Text>
            <Pressable 
              style={styles.addFirstChildButton}
              onPress={() => router.push('/children/add')}
            >
              <Text style={styles.addFirstChildText}>Add Your First Child</Text>
            </Pressable>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  childrenContainer: {
    gap: 16,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  skeletonCard: {
    opacity: 0.7,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9cdcb8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  skeletonAvatar: {
    backgroundColor: '#e5e7eb',
  },
  childAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  childAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  childDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  birthDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skeletonButton: {
    backgroundColor: '#e5e7eb',
    borderColor: '#d1d5db',
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
  addFirstChildButton: {
    backgroundColor: '#bd4ab5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstChildText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  skeletonText: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
});