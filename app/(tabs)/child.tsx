import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, Plus, Edit3, Calendar, User, Trash2, LinkIcon, Users } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = -80;
const SWIPE_OUT_DURATION = 200;

interface Child {
  id: string;
  user_id: string;
  creche_id: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  profile_picture_url: string;
  created_at: string;
  updated_at: string;
  share_code: string | null;
  relationship?: 'owner' | 'parent' | 'guardian' | 'relative';
  permissions?: {
    edit: boolean;
    view: boolean;
    manage: boolean;
  };
}

const ChildCardSkeleton = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonAvatar} />
    <View style={styles.skeletonInfo}>
      <View style={[styles.skeletonLine, { width: '60%' }]} />
      <View style={styles.skeletonDetails}>
        <View style={[styles.skeletonLine, { width: 80 }]} />
        <View style={[styles.skeletonLine, { width: 60 }]} />
      </View>
      <View style={[styles.skeletonLine, { width: '40%' }]} />
    </View>
    <View style={styles.skeletonButton} />
  </View>
);

// Function to generate avatar color based on name
const getAvatarColor = (firstName: string, lastName: string) => {
  const colors = [
    '#9cdcb8', // Green
    '#84a7f6', // Blue
    '#f68484', // Red
    '#f6cc84', // Yellow
    '#bd84f6', // Purple
    '#84d9f6', // Light Blue
    '#f6a884', // Orange
  ];
  
  const name = `${firstName}${lastName}`;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Enhanced Child Card with better image handling
const EnhancedChildCard = ({ 
  child, 
  onEdit, 
  onView, 
  onDelete 
}: { 
  child: Child;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

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

  const shouldShowInitials = !child.profile_picture_url || imageError;

  // Check if user can edit this child
  const canEdit = child.relationship === 'owner' || (child.permissions && child.permissions.edit === true);

  return (
    <View style={styles.swipeContainer}>
      {/* Delete Background - Only show if user is owner */}
      {child.relationship === 'owner' && (
        <View style={styles.deleteBackground}>
          <Pressable 
            style={styles.deleteButton}
            onPress={onDelete}
          >
            <Trash2 size={20} color="#ffffff" />
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      )}

      {/* Main Card */}
      <View style={styles.childCard}>
        <Pressable 
          style={styles.cardContent}
          onPress={onView}
        >
          <View style={styles.avatarContainer}>
            {shouldShowInitials ? (
              <View 
                style={[
                  styles.avatar, 
                  styles.avatarPlaceholder,
                  { backgroundColor: getAvatarColor(child.first_name, child.last_name) }
                ]}
              >
                <Text style={styles.avatarText}>
                  {getInitials(child.first_name, child.last_name)}
                </Text>
                {child.relationship !== 'owner' && (
                  <View style={styles.sharedBadge}>
                    <Users size={10} color="#ffffff" />
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.avatarImageContainer}>
                <Image 
                  source={{ uri: child.profile_picture_url }} 
                  style={styles.avatar}
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                />
                {child.relationship !== 'owner' && (
                  <View style={styles.sharedBadge}>
                    <Users size={10} color="#ffffff" />
                  </View>
                )}
              </View>
            )}
            
            {/* Loading indicator for image */}
            {!shouldShowInitials && imageLoading && (
              <View style={[styles.avatar, styles.avatarLoading]}>
                <Text style={styles.avatarText}>...</Text>
              </View>
            )}
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.childName}>
                {child.first_name} {child.last_name}
              </Text>
              {child.relationship !== 'owner' && (
                <View style={styles.relationshipBadge}>
                  <Text style={styles.relationshipText}>
                    {child.relationship === 'parent' ? 'Shared' : child.relationship || 'Shared'}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Calendar size={14} color="#6b7280" />
                <Text style={styles.detailText}>
                  {calculateAge(child.date_of_birth)} years
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <User size={14} color="#6b7280" />
                <Text style={styles.detailText}>{child.gender}</Text>
              </View>
            </View>
            
            <Text style={styles.birthDate}>
              Born {new Date(child.date_of_birth).toLocaleDateString()}
            </Text>
          </View>
          
        </Pressable>
      </View>
    </View>
  );
};

export default function ChildrenScreen() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user on component mount
  useEffect(() => {
    getCurrentUser();
  }, []);

  // Set up focus listener to refresh when returning to screen
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchChildren(userId);
      }
    }, [userId])
  );

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      if (user) {
        setUserId(user.id);
        await fetchChildren(user.id);
      } else {
        setLoading(false);
        Alert.alert('Authentication Required', 'Please sign in to view your children');
        router.push('/auth');
      }
    } catch (error: any) {
      console.error('Error getting current user:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load user information. Please try again.');
    }
  };

  const fetchChildren = async (currentUserId: string) => {
    try {
      setLoading(true);
      
      console.log('Fetching children for user:', currentUserId);
      
      // Fetch children that the user OWNS (where user_id = currentUserId)
      const { data: ownedChildren, error: ownedError } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (ownedError) {
        console.error('Error fetching owned children:', ownedError);
        throw ownedError;
      }

      // Fetch children that the user has access to through child_parents table
      const { data: sharedChildren, error: sharedError } = await supabase
        .from('child_parents')
        .select(`
          child:children (*),
          relationship,
          permissions,
          is_verified
        `)
        .eq('user_id', currentUserId)
        .eq('is_verified', true)  // Only show verified relationships
        .order('created_at', { ascending: false });

      if (sharedError) {
        console.error('Error fetching shared children:', sharedError);
        throw sharedError;
      }

      // Process owned children
      const ownedChildrenWithMeta = (ownedChildren || []).map(child => ({
        ...child,
        relationship: 'owner' as const,
        permissions: {
          edit: true,
          view: true,
          manage: true
        }
      }));

      // Process shared children
      const sharedChildrenWithMeta = (sharedChildren || [])
        .filter(item => item.child)  // Filter out null children
        .map(item => ({
          ...item.child,
          relationship: item.relationship || 'parent',
          permissions: item.permissions || { edit: false, view: true, manage: false }
        }));

      // Combine both lists and remove duplicates (in case a child appears in both)
      const allChildren = [...ownedChildrenWithMeta, ...sharedChildrenWithMeta];
      
      // Remove duplicates based on child id
      const uniqueChildren = Array.from(
        new Map(allChildren.map(child => [child.id, child])).values()
      );

      console.log('Fetched children:', {
        owned: ownedChildrenWithMeta.length,
        shared: sharedChildrenWithMeta.length,
        total: uniqueChildren.length
      });
      
      setChildren(uniqueChildren);
      
    } catch (error: any) {
      console.error('Error fetching children:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to load children profiles. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userId) {
      await fetchChildren(userId);
    } else {
      await getCurrentUser();
    }
  };

  const handleDeleteChild = (child: Child) => {
    // Only allow deletion if user is the owner
    if (child.relationship !== 'owner') {
      Alert.alert(
        'Permission Denied',
        `You cannot delete ${child.first_name}'s profile as you are not the primary parent.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Profile',
      `Are you sure you want to remove ${child.first_name}'s profile? This will remove access for all linked parents.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDeleteChild(child.id, child.first_name),
        },
      ]
    );
  };

  const confirmDeleteChild = async (childId: string, childName: string) => {
    try {
      setDeletingId(childId);
      
      // Get current user to verify ownership
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify this child belongs to the current user as owner
      const { data: childData, error: fetchError } = await supabase
        .from('children')
        .select('user_id')
        .eq('id', childId)
        .single();

      if (fetchError) throw fetchError;
      
      if (childData.user_id !== user.id) {
        Alert.alert('Error', 'You do not have permission to delete this child profile');
        return;
      }

      // Check for active applications
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select('id')
        .eq('child_id', childId);

      if (appsError) throw appsError;

      if (applications && applications.length > 0) {
        Alert.alert(
          'Active Applications',
          `${childName} has active applications. Please withdraw all applications before deleting this profile.`,
          [{ text: 'OK' }]
        );
        return;
      }

      // Delete child profile (this will cascade to child_parents due to foreign key constraint)
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId)
        .eq('user_id', user.id); // Additional security check

      if (error) throw error;

      // Remove from local state
      setChildren(prev => prev.filter(child => child.id !== childId));
      
      Alert.alert('Success', `${childName}'s profile has been deleted`);
    } catch (error: any) {
      console.error('Error deleting child:', error);
      Alert.alert('Error', error.message || 'Failed to delete profile');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditChild = (child: Child) => {
    // Check if user has edit permissions
    const canEdit = child.relationship === 'owner' || (child.permissions && child.permissions.edit === true);
    
    if (!canEdit) {
      Alert.alert(
        'Permission Denied',
        `You do not have permission to edit ${child.first_name}'s profile.`,
        [{ text: 'OK' }]
      );
      return;
    }

    router.push(`/children/${child.id}/edit`);
  };

  const handleViewChild = (childId: string) => {
    router.push(`/children/${childId}`);
  };

  const handleAddChild = () => {
    router.push('/children/add');
  };

  const handleJoinChild = () => {
    router.push('/join-child');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Children</Text>
        <View style={styles.headerActions}>
          <Pressable 
            style={styles.headerButton}
            onPress={handleJoinChild}
          >
            <LinkIcon size={20} color="#8b5cf6" />
          </Pressable>
          <Pressable 
            style={styles.headerButton}
            onPress={handleAddChild}
          >
            <Plus size={20} color="#8b5cf6" />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8b5cf6']}
            tintColor="#8b5cf6"
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.childrenList}>
            <ChildCardSkeleton />
            <ChildCardSkeleton />
          </View>
        ) : children.length > 0 ? (
          <View style={styles.childrenList}>
            {/* Show owned children first */}
            {children
              .filter(child => child.relationship === 'owner')
              .map((child) => (
                <EnhancedChildCard
                  key={child.id}
                  child={child}
                  onEdit={() => handleEditChild(child)}
                  onView={() => handleViewChild(child.id)}
                  onDelete={() => handleDeleteChild(child)}
                />
              ))}
            
            {/* Then show shared children */}
            {children
              .filter(child => child.relationship !== 'owner')
              .map((child) => (
                <EnhancedChildCard
                  key={child.id}
                  child={child}
                  onEdit={() => handleEditChild(child)}
                  onView={() => handleViewChild(child.id)}
                  onDelete={() => handleDeleteChild(child)}
                />
              ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIllustration}>
              <User size={64} color="#d1d5db" />
            </View>
            <Text style={styles.emptyTitle}>No Children</Text>
            <Text style={styles.emptySubtitle}>
              Add your children or join existing profiles to get started
            </Text>
            <View style={styles.buttonGroup}>
              <Pressable 
                style={[styles.primaryButton, styles.joinButton]}
                onPress={handleJoinChild}
              >
                <LinkIcon size={20} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Join Child</Text>
              </Pressable>
              <Pressable 
                style={styles.primaryButton}
                onPress={handleAddChild}
              >
                <Plus size={20} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Add Child</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Loading Overlay for deletion */}
      {deletingId && (
        <View style={styles.overlay}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Deleting...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  childrenList: {
    gap: 16,
  },
  
  // Swipeable Card Styles
  swipeContainer: {
    position: 'relative',
    height: 100,
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ef4444',
    borderRadius: 16,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 20,
  },
  deleteButton: {
    alignItems: 'center',
    padding: 12,
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  childCard: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    flex: 1,
  },
  avatarContainer: {
    marginRight: 16,
    position: 'relative',
  },
  avatarImageContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarLoading: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  sharedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8b5cf6',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  infoContainer: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  childName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  relationshipBadge: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  relationshipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  birthDate: {
    fontSize: 13,
    color: '#9ca3af',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  editButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#f3f4f6',
  },
  
  // Skeleton Styles
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    height: 100,
  },
  skeletonAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    marginRight: 16,
  },
  skeletonInfo: {
    flex: 1,
  },
  skeletonDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#bd84f6',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#bd84f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    flex: 1,
    justifyContent: 'center',
  },
  joinButton: {
    backgroundColor: '#8b5cf6',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Loading Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
});