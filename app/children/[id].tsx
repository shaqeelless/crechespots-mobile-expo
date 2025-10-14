import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Baby, 
  User, 
  Calendar, 
  Users, 
  Mail,
  Edit3,
  Save,
  X,
  Plus,
  Link,
  Trash2
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  user_id: string;
  created_at: string;
  special_needs?: string;
  allergies?: string;
  medical_conditions?: string;
}

interface Parent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

interface ParentInvitation {
  id: string;
  invited_email: string;
  status: string;
  created_at: string;
}

// Skeleton Loading Component
const SkeletonLoader = () => {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonBackButton} />
        <View style={styles.skeletonHeaderTitle} />
        <View style={styles.skeletonPlaceholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Child Info Skeleton */}
        <View style={styles.skeletonSection}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonInputRow}>
            <View style={styles.skeletonInput} />
            <View style={styles.skeletonInput} />
          </View>
          <View style={styles.skeletonInput} />
          <View style={styles.skeletonInput} />
        </View>

        {/* Medical Info Skeleton */}
        <View style={styles.skeletonSection}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonTextArea} />
          <View style={styles.skeletonTextArea} />
          <View style={styles.skeletonTextArea} />
        </View>

        {/* Linked Parents Skeleton */}
        <View style={styles.skeletonSection}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonParentCard} />
          <View style={styles.skeletonParentCard} />
        </View>

        {/* Save Button Skeleton */}
        <View style={styles.skeletonSubmitSection}>
          <View style={styles.skeletonSubmitButton} />
        </View>
      </ScrollView>
    </View>
  );
};

export default function ChildDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { profile } = useAuth();

  // Get the child ID from the URL parameters
  // In Expo Router, the parameter name matches the file name: [id].tsx -> params.id
  const childId = params.id as string;

  const [child, setChild] = useState<Child | null>(null);
  const [linkedParents, setLinkedParents] = useState<Parent[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<ParentInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    special_needs: '',
    allergies: '',
    medical_conditions: '',
  });

  useEffect(() => {
    console.log('ChildDetailsScreen mounted with params:', params);
    console.log('Child ID from params:', childId);
    
    if (childId) {
      fetchChildDetails();
    } else {
      setError('No child ID provided in URL');
      setLoading(false);
    }
  }, [childId]);

  const fetchChildDetails = async () => {
    console.log('Starting to fetch child details for ID:', childId);
    try {
      setLoading(true);
      setError(null);

      // Fetch child details
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Child data fetched:', data);
      
      if (!data) {
        throw new Error('Child not found in database');
      }

      setChild(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        special_needs: data.special_needs || '',
        allergies: data.allergies || '',
        medical_conditions: data.medical_conditions || '',
      });

      // Fetch linked parents and invitations
      await Promise.all([
        fetchLinkedParents(),
        fetchPendingInvitations()
      ]);

    } catch (error) {
      console.error('Error in fetchChildDetails:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load child details';
      setError(errorMessage);
    } finally {
      console.log('Finished loading, setting loading to false');
      setLoading(false);
    }
  };

  const fetchLinkedParents = async () => {
    try {
      console.log('Fetching linked parents...');
      // Get all users linked to this child
      const { data, error } = await supabase
        .from('children')
        .select(`
          user_profiles:user_id (
            id,
            first_name,
            last_name,
            email,
            phone_number
          )
        `)
        .eq('id', childId);

      if (error) {
        console.error('Error fetching linked parents:', error);
        throw error;
      }

      console.log('Linked parents data:', data);
      const parents = data?.map(item => item.user_profiles).filter(Boolean) || [];
      setLinkedParents(parents);
    } catch (error) {
      console.error('Error in fetchLinkedParents:', error);
      // Don't set overall error, just log it
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      console.log('Fetching pending invitations...');
      const { data, error } = await supabase
        .from('parent_invitations')
        .select('*')
        .eq('child_id', childId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        throw error;
      }

      console.log('Pending invitations:', data);
      setPendingInvitations(data || []);
    } catch (error) {
      console.error('Error in fetchPendingInvitations:', error);
      // Don't set overall error, just log it
    }
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('children')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          special_needs: formData.special_needs,
          allergies: formData.allergies,
          medical_conditions: formData.medical_conditions,
        })
        .eq('id', childId);

      if (error) throw error;

      Alert.alert('Success', 'Child details updated successfully.');
      setEditing(false);
      fetchChildDetails();
    } catch (error) {
      console.error('Error updating child:', error);
      Alert.alert('Error', 'Failed to update child details.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!profile) {
      Alert.alert('Error', 'You must be logged in to send invites');
      return;
    }

    try {
      setSendingInvite(true);
      
      // Check if user exists
      const { data: invitedUser, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('email', inviteEmail.toLowerCase())
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // Create invitation record
      const inviteData = {
        child_id: childId,
        inviter_id: profile.id,
        inviter_name: `${profile.first_name} ${profile.last_name}`,
        invited_email: inviteEmail.toLowerCase(),
        invited_user_id: invitedUser?.id || null,
        message: `${profile.first_name} ${profile.last_name} has invited you to be linked as a parent to ${child?.first_name}'s profile.`,
        status: 'pending',
      };

      const { error: inviteError } = await supabase
        .from('parent_invitations')
        .insert([inviteData]);

      if (inviteError) throw inviteError;

      Alert.alert(
        'Invitation Sent!',
        invitedUser 
          ? 'The parent invitation has been sent successfully. They will receive a notification in the app.'
          : 'An invitation email has been sent. If they don\'t have an account, they\'ll be prompted to create one.'
      );

      setInviteEmail('');
      setShowInviteForm(false);
      fetchPendingInvitations();
    } catch (error) {
      console.error('Error sending invite:', error);
      Alert.alert('Error', 'Failed to send invitation. Please try again.');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRemoveParent = async (parentId: string) => {
    Alert.alert(
      'Remove Parent',
      'Are you sure you want to remove this parent from the child\'s profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('children')
                .update({ user_id: null })
                .eq('id', childId)
                .eq('user_id', parentId);

              if (error) throw error;

              Alert.alert('Success', 'Parent removed successfully.');
              fetchLinkedParents();
            } catch (error) {
              console.error('Error removing parent:', error);
              Alert.alert('Error', 'Failed to remove parent.');
            }
          },
        },
      ]
    );
  };

  const getChildAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'Unknown';
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                  (today.getMonth() - birthDate.getMonth());
    
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(months / 12);
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
  };

  // Debug information
  console.log('Current state:', {
    loading,
    error,
    child,
    childId,
    hasChild: !!child,
    linkedParentsCount: linkedParents.length,
    pendingInvitationsCount: pendingInvitations.length
  });

  if (loading) {
    console.log('Rendering skeleton loader');
    return <SkeletonLoader />;
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Error Loading Child</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <Text style={styles.debugText}>Child ID from URL: {childId}</Text>
        <Text style={styles.debugText}>All params: {JSON.stringify(params)}</Text>
        <Pressable style={styles.retryButton} onPress={fetchChildDetails}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (!child) {
    console.log('Rendering no child state');
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Child not found</Text>
        <Text style={styles.debugText}>Child ID: {childId}</Text>
        <Pressable style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  console.log('Rendering child details for:', child.first_name, child.last_name);
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
        <Pressable 
          style={styles.editButton}
          onPress={() => setEditing(!editing)}
        >
          {editing ? (
            <X size={20} color="#ef4444" />
          ) : (
            <Edit3 size={20} color="#bd4ab5" />
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {/* Child Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Child Information</Text>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <User size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={formData.first_name}
                onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                editable={editing}
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <User size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={formData.last_name}
                onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                editable={editing}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Calendar size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.date_of_birth}
                onChangeText={(text) => setFormData({ ...formData, date_of_birth: text })}
                editable={editing}
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Baby size={20} color="#9ca3af" />
              <TextInput
                style={styles.input}
                placeholder="Gender"
                value={formData.gender}
                onChangeText={(text) => setFormData({ ...formData, gender: text })}
                editable={editing}
              />
            </View>
          </View>

          {formData.date_of_birth && (
            <View style={styles.ageContainer}>
              <Text style={styles.ageText}>
                Age: {getChildAge(formData.date_of_birth)}
              </Text>
            </View>
          )}
        </View>

        {/* Medical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>
          
          <View style={styles.textAreaContainer}>
            <Text style={styles.textAreaLabel}>Special Needs</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Any special needs or requirements..."
              value={formData.special_needs}
              onChangeText={(text) => setFormData({ ...formData, special_needs: text })}
              multiline
              numberOfLines={3}
              editable={editing}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.textAreaContainer}>
            <Text style={styles.textAreaLabel}>Allergies</Text>
            <TextInput
              style={styles.textArea}
              placeholder="List any allergies..."
              value={formData.allergies}
              onChangeText={(text) => setFormData({ ...formData, allergies: text })}
              multiline
              numberOfLines={2}
              editable={editing}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.textAreaContainer}>
            <Text style={styles.textAreaLabel}>Medical Conditions</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Any medical conditions or medications..."
              value={formData.medical_conditions}
              onChangeText={(text) => setFormData({ ...formData, medical_conditions: text })}
              multiline
              numberOfLines={3}
              editable={editing}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Linked Parents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Linked Parents</Text>
            <Pressable 
              style={styles.inviteButton}
              onPress={() => setShowInviteForm(!showInviteForm)}
            >
              <Plus size={16} color="#bd4ab5" />
              <Text style={styles.inviteButtonText}>Invite Parent</Text>
            </Pressable>
          </View>

          {/* Invite Form */}
          {showInviteForm && (
            <View style={styles.inviteForm}>
              <Text style={styles.inviteTitle}>Invite Another Parent</Text>
              <Text style={styles.inviteDescription}>
                Invite another parent or guardian to be linked to this child's profile.
              </Text>
              
              <View style={styles.inputContainer}>
                <Mail size={20} color="#9ca3af" />
                <TextInput
                  style={styles.input}
                  placeholder="Parent's Email Address"
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inviteActions}>
                <Pressable 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowInviteForm(false);
                    setInviteEmail('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.primaryButton, sendingInvite && styles.disabledButton]}
                  onPress={handleSendInvite}
                  disabled={sendingInvite}
                >
                  {sendingInvite ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Link size={16} color="#ffffff" />
                  )}
                  <Text style={styles.primaryButtonText}>
                    {sendingInvite ? 'Sending...' : 'Send Invite'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Linked Parents List */}
          {linkedParents.length > 0 ? (
            linkedParents.map((parent) => (
              <View key={parent.id} style={styles.parentCard}>
                <View style={styles.parentInfo}>
                  <View style={styles.parentAvatar}>
                    <User size={16} color="#ffffff" />
                  </View>
                  <View style={styles.parentDetails}>
                    <Text style={styles.parentName}>
                      {parent.first_name} {parent.last_name}
                    </Text>
                    <Text style={styles.parentEmail}>{parent.email}</Text>
                    {parent.phone_number && (
                      <Text style={styles.parentPhone}>{parent.phone_number}</Text>
                    )}
                  </View>
                </View>
                {linkedParents.length > 1 && (
                  <Pressable 
                    style={styles.removeButton}
                    onPress={() => handleRemoveParent(parent.id)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </Pressable>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noParentsText}>No parents linked yet</Text>
          )}

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <View style={styles.pendingSection}>
              <Text style={styles.pendingTitle}>Pending Invitations</Text>
              {pendingInvitations.map((invite) => (
                <View key={invite.id} style={styles.pendingInvite}>
                  <Mail size={16} color="#6b7280" />
                  <Text style={styles.pendingEmail}>{invite.invited_email}</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>Pending</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Save Button */}
        {editing && (
          <View style={styles.submitSection}>
            <Pressable 
              style={[styles.submitButton, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Save size={20} color="#ffffff" />
              )}
              <Text style={styles.submitButtonText}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
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
  editButton: {
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
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  ageContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  ageText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  textAreaContainer: {
    marginBottom: 16,
  },
  textAreaLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#374151',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlignVertical: 'top',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fdf2f8',
    borderWidth: 1,
    borderColor: '#bd4ab5',
  },
  inviteButtonText: {
    color: '#bd4ab5',
    fontSize: 14,
    fontWeight: '600',
  },
  inviteForm: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  inviteDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#bd4ab5',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  parentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  parentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  parentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#bd4ab5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  parentDetails: {
    flex: 1,
  },
  parentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  parentEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  parentPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  removeButton: {
    padding: 8,
  },
  noParentsText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  pendingSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pendingInvite: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  pendingEmail: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  submitSection: {
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: '#bd4ab5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: '#bd4ab5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
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
    width: 160,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonPlaceholder: {
    width: 40,
  },
  skeletonSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  skeletonSectionTitle: {
    width: '40%',
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonInputRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  skeletonInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  skeletonTextArea: {
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 16,
  },
  skeletonParentCard: {
    height: 72,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 12,
  },
  skeletonSubmitSection: {
    paddingBottom: 40,
  },
  skeletonSubmitButton: {
    height: 52,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
});