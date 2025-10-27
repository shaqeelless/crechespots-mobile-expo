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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, User, Phone, Mail, MessageCircle, Baby, MapPin } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

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

export default function ApplyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [creche, setCreche] = useState<Creche | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    message: '',
  });

  const { profile } = useAuth();

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

      // Pre-select first child if available
      if (childrenData && childrenData.length > 0) {
        setSelectedChild(childrenData[0].id);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load application form');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedChild) {
      Alert.alert('Error', 'Please select a child for this application');
      return;
    }

    if (!profile) {
      Alert.alert('Error', 'Please complete your profile before applying');
      return;
    }

    try {
      setSubmitting(true);

      const applicationData = {
        creche_id: id,
        child_id: selectedChild,
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

      if (error) throw error;

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

    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Loading application form...</Text>
      </View>
    );
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Apply to Creche</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Creche Info */}
        <View style={styles.crecheSection}>
          <Image source={{ uri: creche.header_image }} style={styles.crecheImage} />
          <View style={styles.crecheInfo}>
            <Text style={styles.crecheName}>{creche.name}</Text>
            <Text style={styles.crecheAddress}>{creche.address}</Text>
          </View>
        </View>

        {/* Child Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Child</Text>
          {children.length > 0 ? (
            <View style={styles.childrenContainer}>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  style={[
                    styles.childOption,
                    selectedChild === child.id && styles.selectedChildOption,
                  ]}
                  onPress={() => setSelectedChild(child.id)}
                >
                  <View style={styles.childAvatar}>
                    <Text style={styles.childAvatarText}>
                      {getInitials(child.first_name, child.last_name)}
                    </Text>
                  </View>
                  <View style={styles.childDetails}>
                    <Text style={styles.childName}>
                      {child.first_name} {child.last_name}
                    </Text>
                    <Text style={styles.childAge}>
                      {calculateAge(child.date_of_birth)} years old • {child.gender}
                    </Text>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedChild === child.id && styles.selectedRadioButton,
                  ]} />
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.noChildrenContainer}>
              <Baby size={32} color="#9ca3af" />
              <Text style={styles.noChildrenText}>No children profiles found</Text>
              <Pressable 
                style={styles.addChildButton}
                onPress={() => router.push('/children/add')}
              >
                <Text style={styles.addChildButtonText}>Add Child Profile</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Parent Information */}
        <View style={styles.section}>
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
        </View>

        {/* Message */}
        <View style={styles.section}>
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
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Pressable 
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Text>
          </Pressable>
          
          <Text style={styles.disclaimer}>
            By submitting this application, you agree to share your contact information 
            with the creche for communication purposes.
          </Text>
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
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  selectedRadioButton: {
    borderColor: '#bd84f6',
    backgroundColor: '#bd84f6',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
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
    opacity: 0.6,
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
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
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
});