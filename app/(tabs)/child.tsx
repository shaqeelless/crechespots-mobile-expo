import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Edit3, Calendar, User, Trash2, LinkIcon } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = -80;
const SWIPE_OUT_DURATION = 200;

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

// Swipeable Child Card Component
const SwipeableChildCard = ({ 
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
  const position = new Animated.ValueXY();
  const [isSwiped, setIsSwiped] = useState(false);

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

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isSwiped,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2);
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        position.setValue({ x: Math.max(gestureState.dx, -100), y: 0 });
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < SWIPE_THRESHOLD) {
        // Swipe left beyond threshold - show delete
        Animated.spring(position, {
          toValue: { x: -80, y: 0 },
          useNativeDriver: false,
        }).start();
        setIsSwiped(true);
      } else {
        // Return to original position
        resetPosition();
      }
    },
  });

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
    setIsSwiped(false);
  };

  const handleCardPress = () => {
    if (isSwiped) {
      resetPosition();
    } else {
      onView();
    }
  };

  const handleEditPress = (e: any) => {
    e.stopPropagation();
    if (isSwiped) {
      resetPosition();
    } else {
      onEdit();
    }
  };

  const cardStyle = {
    transform: position.getTranslateTransform(),
  };

  return (
    <View style={styles.swipeContainer}>
      {/* Delete Background */}
      {isSwiped && (
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
      <Animated.View 
        style={[styles.childCard, cardStyle]}
        {...panResponder.panHandlers}
      >
        <Pressable 
          style={styles.cardContent}
          onPress={handleCardPress}
        >
          <View style={styles.avatarContainer}>
            {child.profile_picture_url ? (
              <Image 
                source={{ uri: child.profile_picture_url }} 
                style={styles.avatar} 
                onError={(e) => {
                  // If image fails to load, fall back to initials
                  console.log('Image failed to load, using initials');
                }}
              />
            ) : (
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
              </View>
            )}
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.childName}>
              {child.first_name} {child.last_name}
            </Text>
            
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

                    <View 
            style={styles.editButton}
          >
            <Edit3 size={18} color="#bd84f6" />
          </View>
          
        </Pressable>
      </Animated.View>
    </View>
  );
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

  return (
    <View style={styles.swipeContainer}>
      {/* Delete Background */}
      <View style={styles.deleteBackground}>
        <Pressable 
          style={styles.deleteButton}
          onPress={onDelete}
        >
          <Trash2 size={20} color="#ffffff" />
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>

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
              </View>
            ) : (
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
            )}
            
            {/* Loading indicator for image */}
            {!shouldShowInitials && imageLoading && (
              <View style={[styles.avatar, styles.avatarLoading]}>
                <Text style={styles.avatarText}>...</Text>
              </View>
            )}
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.childName}>
              {child.first_name} {child.last_name}
            </Text>
            
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
          
          <View 
            style={styles.editButton}
          >
            <Edit3 size={18} color="#bd84f6" />
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      Alert.alert('Error', 'Failed to load children profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChild = (child: Child) => {
    Alert.alert(
      'Delete Profile',
      `Remove ${child.first_name}'s profile? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDeleteChild(child.id),
        },
      ]
    );
  };

  const confirmDeleteChild = async (childId: string) => {
    try {
      setDeletingId(childId);
      
      // Check for active applications
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select('id')
        .eq('child_id', childId);

      if (appsError) throw appsError;

      if (applications && applications.length > 0) {
        Alert.alert(
          'Active Applications',
          'Please withdraw all applications before deleting this profile.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Delete child profile
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);

      if (error) throw error;

      setChildren(prev => prev.filter(child => child.id !== childId));
      
      Alert.alert('Success', 'Profile deleted successfully');
    } catch (error) {
      console.error('Error deleting child:', error);
      Alert.alert('Error', 'Failed to delete profile');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditChild = (childId: string) => {
    router.push(`/children/${childId}/edit`);
  };

  const handleViewChild = (childId: string) => {
    router.push(`/children/${childId}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}

<View style={styles.header}>
  <Text style={styles.title}>My Children</Text>
  <View style={styles.headerActions}>
    <Pressable 
      style={styles.headerButton}
      onPress={() => router.push('/join-child')}
    >
      <LinkIcon size={20} color="#8b5cf6" />
    </Pressable>
    <Pressable 
      style={styles.headerButton}
      onPress={() => router.push('/children/add')}
    >
      <Plus size={20} color="#8b5cf6" />
    </Pressable>
  </View>
</View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.childrenList}>
            <ChildCardSkeleton />
            <ChildCardSkeleton />
          </View>
        ) : children.length > 0 ? (
          <View style={styles.childrenList}>
            {children.map((child) => (
              <EnhancedChildCard
                key={child.id}
                child={child}
                onEdit={() => handleEditChild(child.id)}
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
            <Text style={styles.emptyTitle}>No Children Added</Text>
            <Text style={styles.emptySubtitle}>
              Add your children to start applying to creches
            </Text>
            <Pressable 
              style={styles.primaryButton}
              onPress={() => router.push('/children/add')}
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Add First Child</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Loading Overlay */}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  addButton: {
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
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
  infoContainer: {
    flex: 1,
  },
  childName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
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
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#bd84f6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#bd84f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

   headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // This controls the space between buttons
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
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