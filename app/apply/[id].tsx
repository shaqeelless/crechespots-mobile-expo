import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, User, Phone, Mail, MessageCircle, Baby, MapPin, AlertCircle } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
}

interface Creche {
  id: string;
  name: string;
  header_image: string;
  address: string;
}

interface ExistingApplication {
  child_id: string;
  application_status: string;
  submitted_at: string;
}

// Animated Components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Skeleton Loading Components
const SkeletonLoader = () => {
  return (
    <AnimatedView entering={FadeIn.duration(600)} style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonBackButton} />
        <View style={styles.skeletonHeaderTitle} />
        <View style={styles.skeletonPlaceholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Creche Info Skeleton */}
        <View style={styles.skeletonCrecheSection}>
          <View style={styles.skeletonCrecheImage} />
          <View style={styles.skeletonCrecheInfo}>
            <View style={styles.skeletonCrecheName} />
            <View style={styles.skeletonCrecheAddress} />
          </View>
        </View>

        {/* Child Selection Skeleton */}
        <View style={styles.skeletonSection}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonChildrenContainer}>
            {[1, 2].map((item) => (
              <View key={item} style={styles.skeletonChildOption}>
                <View style={styles.skeletonChildAvatar} />
                <View style={styles.skeletonChildDetails}>
                  <View style={styles.skeletonChildName} />
                  <View style={styles.skeletonChildAge} />
                </View>
                <View style={styles.skeletonRadioButton} />
              </View>
            ))}
          </View>
        </View>

        {/* Parent Information Skeleton */}
        <View style={styles.skeletonSection}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonInfoDisplay}>
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.skeletonInfoRow}>
                <View style={styles.skeletonInfoIcon} />
                <View style={styles.skeletonInfoLabel} />
                <View style={styles.skeletonInfoValue} />
              </View>
            ))}
          </View>
          <View style={styles.skeletonEditProfileButton} />
        </View>

        {/* Message Skeleton */}
        <View style={styles.skeletonSection}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonMessageContainer}>
            <View style={styles.skeletonMessageIcon} />
            <View style={styles.skeletonMessageInput} />
          </View>
        </View>

        {/* Submit Button Skeleton */}
        <View style={styles.skeletonSubmitSection}>
          <View style={styles.skeletonSubmitButton} />
          <View style={styles.skeletonDisclaimer} />
        </View>
      </ScrollView>
    </AnimatedView>
  );
};

// Animated Skeleton Component
const AnimatedSkeleton = () => {
  const translateX = useSharedValue(-width);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(width, { duration: 1000 }),
        withTiming(-width, { duration: 0 })
      ),
      -1
    );
  }, []);

  return (
    <AnimatedView
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
        },
        animatedStyle,
      ]}
    />
  );
};

// Custom child component with built-in animation and duplicate check
const AnimatedChildOption = ({ 
  child, 
  index, 
  isSelected, 
  existingApplication,
  onPress 
}: { 
  child: Child;
  index: number;
  isSelected: boolean;
  existingApplication: ExistingApplication | null;
  onPress: () => void;
}) => {
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#10b981';
      case 'declined': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasExistingApplication = !!existingApplication;

  return (
    <AnimatedPressable
      style={[
        styles.childOption,
        isSelected && styles.selectedChildOption,
        hasExistingApplication && styles.disabledChildOption,
      ]}
      onPress={onPress}
      disabled={hasExistingApplication}
      entering={FadeInUp.delay(600 + index * 100).duration(400).springify()}
    >
      <View style={styles.childAvatar}>
        <Text style={styles.childAvatarText}>
          {getInitials(child.first_name, child.last_name)}
        </Text>
      </View>
      <View style={styles.childDetails}>
        <Text style={[
          styles.childName,
          hasExistingApplication && styles.disabledText
        ]}>
          {child.first_name} {child.last_name}
        </Text>
        <Text style={[
          styles.childAge,
          hasExistingApplication && styles.disabledText
        ]}>
          {calculateAge(child.date_of_birth)} years old • {child.gender}
        </Text>
        {hasExistingApplication && (
          <View style={styles.existingApplicationInfo}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(existingApplication.application_status)}15` }
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(existingApplication.application_status) }
              ]} />
              <Text style={[
                styles.statusText,
                { color: getStatusColor(existingApplication.application_status) }
              ]}>
                {existingApplication.application_status}
              </Text>
            </View>
            <Text style={styles.applicationDate}>
              Applied on {formatDate(existingApplication.submitted_at)}
            </Text>
          </View>
        )}
      </View>
      <View style={[
        styles.radioButton,
        isSelected && styles.selectedRadioButton,
        hasExistingApplication && styles.disabledRadioButton,
      ]}>
        {hasExistingApplication && (
          <AlertCircle size={12} color="#ffffff" />
        )}
      </View>
    </AnimatedPressable>
  );
};

export default function ApplyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [creche, setCreche] = useState<Creche | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingApplications, setExistingApplications] = useState<Record<string, ExistingApplication>>({});
  
  const [formData, setFormData] = useState({
    message: '',
  });

  const { profile, user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch creche details
      const { data: crecheData, error: crecheError } = await supabase
        .from('creches')
        .select('id, name, header_image, address')
        .eq('id', id)
        .single();

      if (crecheError) throw crecheError;
      setCreche(crecheData);

      // Fetch user's children
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: false });

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);

      // Check for existing applications
      if (childrenData && childrenData.length > 0 && user) {
        const childIds = childrenData.map(child => child.id);
        
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('child_id, application_status, submitted_at')
          .eq('creche_id', id)
          .eq('user_id', user.id)
          .in('child_id', childIds);

        if (applicationsError) throw applicationsError;

        // Create a mapping of child_id to existing application
        const existingApps: Record<string, ExistingApplication> = {};
        applicationsData?.forEach(app => {
          existingApps[app.child_id] = {
            child_id: app.child_id,
            application_status: app.application_status,
            submitted_at: app.submitted_at
          };
        });
        setExistingApplications(existingApps);

        // Pre-select first available child (not already applied)
        const firstAvailableChild = childrenData.find(child => !existingApps[child.id]);
        if (firstAvailableChild) {
          setSelectedChild(firstAvailableChild.id);
        } else if (childrenData.length > 0) {
          // If all children already applied, select none
          setSelectedChild('');
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load application form');
    } finally {
      setLoading(false);
    }
  };

  const checkDuplicateApplication = async (childId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('id')
        .eq('creche_id', id)
        .eq('child_id', childId)
        .eq('user_id', user?.id)
        .single();

      // If we get data, it means an application already exists
      return !!data;
    } catch (error) {
      // If no record found, it will throw an error
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!selectedChild) {
      Alert.alert('Error', 'Please select a child for this application');
      return;
    }

    // Check if child already has an application
    if (existingApplications[selectedChild]) {
      const existingApp = existingApplications[selectedChild];
      Alert.alert(
        'Already Applied',
        `You already have a ${existingApp.application_status} application for this child at ${creche?.name}.`,
        [
          {
            text: 'View Applications',
            onPress: () => router.push('/applications'),
          },
          { text: 'OK' },
        ]
      );
      return;
    }

    if (!profile || !user) {
      Alert.alert('Error', 'Please complete your profile before applying');
      return;
    }

    try {
      setSubmitting(true);

      const applicationData = {
        creche_id: id,
        child_id: selectedChild,
        user_id: user.id, // Important: Include user_id for the unique constraint
        parent_name: `${profile.first_name} ${profile.last_name}`,
        parent_phone_number: profile.phone_number || '',
        parent_email: profile.email,
        parent_address: [profile.suburb, profile.city, profile.province].filter(Boolean).join(', '),
        message: formData.message,
        source: 'mobile_app',
        application_status: 'New',
      };

      const { error } = await supabase
        .from('applications')
        .insert([applicationData]);

      if (error) {
        // Check if it's a duplicate key violation
        if (error.code === '23505') { // PostgreSQL unique violation code
          Alert.alert(
            'Duplicate Application',
            'This child already has an application for this creche. Please check your applications.',
            [
              {
                text: 'View Applications',
                onPress: () => router.push('/applications'),
              },
              { 
                text: 'Refresh',
                onPress: () => fetchData()
              },
            ]
          );
          return;
        }
        throw error;
      }

      // Add the new application to the existing applications mapping
      const newExistingApp: ExistingApplication = {
        child_id: selectedChild,
        application_status: 'New',
        submitted_at: new Date().toISOString()
      };
      setExistingApplications(prev => ({
        ...prev,
        [selectedChild]: newExistingApp
      }));

      Alert.alert(
        'Application Submitted!',
        'Your application has been sent to the creche. They will review it and get back to you soon.',
        [
          {
            text: 'View Applications',
            onPress: () => router.push('/applications'),
          },
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

    } catch (error: any) {
      console.error('Error submitting application:', error);
      
      // Handle different error cases
      if (error.code === '23505') {
        Alert.alert(
          'Duplicate Application',
          'This child already has an application for this creche.',
          [
            {
              text: 'View Applications',
              onPress: () => router.push('/applications'),
            },
            { 
              text: 'Refresh',
              onPress: () => fetchData()
            },
          ]
        );
      } else if (error.message?.includes('unique constraint')) {
        Alert.alert(
          'Already Applied',
          'You have already submitted an application for this child at this creche.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to submit application. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!creche) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Creche not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const getSelectedChildExistingApp = selectedChild ? existingApplications[selectedChild] : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <AnimatedView 
        style={styles.header}
        entering={FadeInDown.duration(600).springify()}
      >
        <AnimatedPressable 
          style={styles.backButton} 
          onPress={() => router.back()}
          entering={ZoomIn.duration(600).springify()}
        >
          <ArrowLeft size={24} color="#374151" />
        </AnimatedPressable>
        <AnimatedText 
          style={styles.headerTitle}
          entering={FadeInUp.delay(200).duration(600).springify()}
        >
          Apply to Creche
        </AnimatedText>
        <View style={styles.placeholder} />
      </AnimatedView>

      <AnimatedScrollView 
        style={styles.content}
        entering={FadeIn.delay(300).duration(600)}
      >
        {/* Creche Info */}
        <AnimatedView 
          style={styles.crecheSection}
          entering={FadeInUp.delay(400).duration(600).springify()}
        >
          <Image source={{ uri: creche.header_image }} style={styles.crecheImage} />
          <View style={styles.crecheInfo}>
            <Text style={styles.crecheName}>{creche.name}</Text>
            <Text style={styles.crecheAddress}>{creche.address}</Text>
          </View>
        </AnimatedView>

        {/* Child Selection */}
        <AnimatedView 
          style={styles.section}
          entering={FadeInUp.delay(500).duration(600).springify()}
        >
          <Text style={styles.sectionTitle}>Select Child</Text>
          {children.length > 0 ? (
            <View style={styles.childrenContainer}>
              {children.map((child, index) => (
                <AnimatedChildOption
                  key={child.id}
                  child={child}
                  index={index}
                  isSelected={selectedChild === child.id}
                  existingApplication={existingApplications[child.id] || null}
                  onPress={() => {
                    const hasExistingApp = !!existingApplications[child.id];
                    if (!hasExistingApp) {
                      setSelectedChild(child.id);
                    }
                  }}
                />
              ))}
            </View>
          ) : (
            <AnimatedView 
              style={styles.noChildrenContainer}
              entering={FadeInUp.delay(600).duration(600).springify()}
            >
              <Baby size={32} color="#9ca3af" />
              <Text style={styles.noChildrenText}>No children profiles found</Text>
              <Pressable 
                style={styles.addChildButton}
                onPress={() => router.push('/children/add')}
              >
                <Text style={styles.addChildButtonText}>Add Child Profile</Text>
              </Pressable>
            </AnimatedView>
          )}
          
          {/* Warning if all children already applied */}
          {children.length > 0 && 
           Object.keys(existingApplications).length === children.length && (
            <AnimatedView 
              style={styles.warningContainer}
              entering={FadeInUp.delay(700).duration(600).springify()}
            >
              <AlertCircle size={20} color="#f59e0b" />
              <Text style={styles.warningText}>
                All your children already have applications for this creche.
                You can check the status in your Applications section.
              </Text>
            </AnimatedView>
          )}
        </AnimatedView>

        {/* Parent Information */}
        <AnimatedView 
          style={styles.section}
          entering={FadeInUp.delay(800).duration(600).springify()}
        >
          <Text style={styles.sectionTitle}>Parent Information (From Your Profile)</Text>
          
          <View style={styles.infoDisplay}>
            <View style={styles.infoRow}>
              <User size={16} color="#6b7280" />
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>
                {profile ? `${profile.first_name} ${profile.last_name}` : 'Not set'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Phone size={16} color="#6b7280" />
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>
                {profile?.phone_number || 'Not set'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Mail size={16} color="#6b7280" />
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>
                {profile?.email || 'Not set'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>
                {profile ? [profile.suburb, profile.city, profile.province].filter(Boolean).join(', ') || 'Not set' : 'Not set'}
              </Text>
            </View>
          </View>

          <Pressable 
            style={styles.editProfileButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Text style={styles.editProfileText}>Edit Profile Information</Text>
          </Pressable>
        </AnimatedView>

        {/* Message */}
        <AnimatedView 
          style={styles.section}
          entering={FadeInUp.delay(900).duration(600).springify()}
        >
          <Text style={styles.sectionTitle}>Message to Creche</Text>
          <View style={styles.messageContainer}>
            <MessageCircle size={20} color="#9ca3af" />
            <TextInput
              style={styles.messageInput}
              placeholder="Tell the creche about your child's needs, preferences, or any questions you have..."
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </AnimatedView>

        {/* Submit Button */}
        <AnimatedView 
          style={styles.submitSection}
          entering={FadeInUp.delay(1000).duration(600).springify()}
        >
          <Pressable 
            style={[
              styles.submitButton, 
              (submitting || getSelectedChildExistingApp) && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={submitting || !!getSelectedChildExistingApp}
          >
            <Text style={styles.submitButtonText}>
              {getSelectedChildExistingApp 
                ? `Already Applied (${getSelectedChildExistingApp.application_status})` 
                : submitting 
                  ? 'Submitting...' 
                  : 'Submit Application'
              }
            </Text>
          </Pressable>
          
          <Text style={styles.disclaimer}>
            By submitting this application, you agree to share your contact information 
            with the creche for communication purposes. Each child can only have one active 
            application per creche.
          </Text>
        </AnimatedView>
      </AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fcfe',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  },
  crecheSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
  },
  crecheImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  crecheInfo: {
    flex: 1,
  },
  crecheName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  crecheAddress: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  childrenContainer: {
    gap: 12,
  },
  childOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  selectedChildOption: {
    borderColor: '#bd84f6',
    backgroundColor: '#fdf2f8',
  },
  disabledChildOption: {
    opacity: 0.7,
    backgroundColor: '#f3f4f6',
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9cdcb8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  childAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  childAge: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  disabledText: {
    color: '#6b7280',
  },
  existingApplicationInfo: {
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  applicationDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioButton: {
    borderColor: '#bd84f6',
    backgroundColor: '#bd84f6',
  },
  disabledRadioButton: {
    borderColor: '#9ca3af',
    backgroundColor: '#9ca3af',
  },
  noChildrenContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noChildrenText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 16,
  },
  addChildButton: {
    backgroundColor: '#bd84f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addChildButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    marginLeft: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    minHeight: 80,
  },
  infoDisplay: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 8,
    width: 60,
  },
  infoValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    marginLeft: 8,
  },
  editProfileButton: {
    backgroundColor: '#bd84f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editProfileText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  submitSection: {
    padding: 20,
  },
  submitButton: {
    backgroundColor: '#bd84f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 16,
  },
  backText: {
    color: '#374151',
    fontWeight: '600',
  },
  // Skeleton Loading Styles
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  skeletonBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  skeletonHeaderTitle: {
    width: 150,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonPlaceholder: {
    width: 40,
  },
  skeletonCrecheSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
  },
  skeletonCrecheImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#e5e7eb',
  },
  skeletonCrecheInfo: {
    flex: 1,
  },
  skeletonCrecheName: {
    height: 18,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  skeletonCrecheAddress: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '50%',
  },
  skeletonSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
  },
  skeletonSectionTitle: {
    height: 18,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
    width: '60%',
  },
  skeletonChildrenContainer: {
    gap: 12,
  },
  skeletonChildOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  skeletonChildAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  skeletonChildDetails: {
    flex: 1,
  },
  skeletonChildName: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  skeletonChildAge: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '40%',
  },
  skeletonRadioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  skeletonInfoDisplay: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  skeletonInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonInfoIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  skeletonInfoLabel: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginLeft: 8,
    width: 60,
  },
  skeletonInfoValue: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
  },
  skeletonEditProfileButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    width: 120,
    height: 28,
  },
  skeletonMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skeletonMessageIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  skeletonMessageInput: {
    flex: 1,
    marginLeft: 12,
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  skeletonSubmitSection: {
    padding: 20,
  },
  skeletonSubmitButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    height: 56,
  },
  skeletonDisclaimer: {
    height: 36,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
});