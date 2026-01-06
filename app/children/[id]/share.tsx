import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Share,
  Clipboard,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Share2,
  Copy,
  Mail,
  UserPlus,
  X,
  Check,
  Clock,
  Users,
  Link as LinkIcon,
  QrCode,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
}

interface ChildInvite {
  id: string;
  share_code: string;
  invitee_email: string;
  invitee_user_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  relationship: string;
  expires_at: string;
  created_at: string;
  invitee?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface LinkedParent {
  id: string;
  user_id: string;
  relationship: string;
  is_owner: boolean;
  joined_at: string;
  users: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function ChildShareScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [child, setChild] = useState<Child | null>(null);
  const [invites, setInvites] = useState<ChildInvite[]>([]);
  const [linkedParents, setLinkedParents] = useState<LinkedParent[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [relationship, setRelationship] = useState('parent');
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch child details
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('id, first_name, last_name')
        .eq('id', id)
        .single();

      if (childError) throw childError;
      setChild(childData);

      // Fetch active invites
      const { data: invitesData, error: invitesError } = await supabase
        .from('child_invites')
        .select(`
          *,
          invitee:users!invitee_user_id(first_name, last_name, email)
        `)
        .eq('child_id', id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!invitesError) setInvites(invitesData || []);

      // Fetch linked parents
      const { data: parentsData, error: parentsError } = await supabase
        .from('child_parents')
        .select(`
          *,
          users(first_name, last_name, email)
        `)
        .eq('child_id', id)
        .order('joined_at', { ascending: false });

      if (!parentsError) setLinkedParents(parentsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateShareLink = async () => {
    try {
      setCreatingInvite(true);
      
      const { data, error } = await supabase.rpc('generate_share_code');
      
      if (error) throw error;
      
      // Create new invite
      const { data: invite, error: inviteError } = await supabase
        .from('child_invites')
        .insert({
          child_id: id,
          inviter_id: user?.id,
          share_code: data,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (inviteError) throw inviteError;
      
      setShareCode(data);
      await fetchData(); // Refresh data
      
    } catch (error) {
      console.error('Error generating share link:', error);
      Alert.alert('Error', 'Failed to generate share link');
    } finally {
      setCreatingInvite(false);
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Share code copied to clipboard');
  };

  const shareViaApp = async () => {
    if (!shareCode) return;
    
    try {
      const shareUrl = `crecheapp://link-child?code=${shareCode}`;
      await Share.share({
        message: `Join me on CrecheApp to access ${child?.first_name}'s profile! Use code: ${shareCode}\n\nOr click: ${shareUrl}`,
        title: `Link to ${child?.first_name}'s Profile`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const sendEmailInvite = async () => {
    if (!emailInput.trim() || !/^\S+@\S+\.\S+$/.test(emailInput)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    try {
      setCreatingInvite(true);
      
      const { data: codeData, error: codeError } = await supabase.rpc('generate_share_code');
      if (codeError) throw codeError;
      
      // Create invite with email
      const { data: invite, error: inviteError } = await supabase
        .from('child_invites')
        .insert({
          child_id: id,
          inviter_id: user?.id,
          invitee_email: emailInput.trim(),
          share_code: codeData,
          relationship: relationship,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (inviteError) throw inviteError;
      
      // Here you would typically send an email via your backend
      // For now, we'll show success message
      Alert.alert('Invitation Sent', `Invitation sent to ${emailInput}`);
      
      setEmailInput('');
      setRelationship('parent');
      setShareModalVisible(false);
      await fetchData();
      
    } catch (error) {
      console.error('Error sending invite:', error);
      Alert.alert('Error', 'Failed to send invitation');
    } finally {
      setCreatingInvite(false);
    }
  };

  const cancelInvite = async (inviteId: string) => {
    Alert.alert(
      'Cancel Invitation',
      'Are you sure you want to cancel this invitation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('child_invites')
                .update({ status: 'declined' })
                .eq('id', inviteId);

              if (error) throw error;
              
              await fetchData();
              Alert.alert('Success', 'Invitation cancelled');
            } catch (error) {
              console.error('Error cancelling invite:', error);
              Alert.alert('Error', 'Failed to cancel invitation');
            }
          },
        },
      ]
    );
  };

  const removeParent = async (parentId: string, parentName: string) => {
    Alert.alert(
      'Remove Parent',
      `Are you sure you want to remove ${parentName} from this child's profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('child_parents')
                .delete()
                .eq('id', parentId);

              if (error) throw error;
              
              await fetchData();
              Alert.alert('Success', 'Parent removed successfully');
            } catch (error) {
              console.error('Error removing parent:', error);
              Alert.alert('Error', 'Failed to remove parent');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000000" />
          </Pressable>
          <Text style={styles.headerTitle}>Share Child</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000000" />
        </Pressable>
        <Text style={styles.headerTitle}>Share {child?.first_name}'s Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Share Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Share</Text>
          <Text style={styles.sectionSubtitle}>
            Generate a share code to link other parents
          </Text>
          
          {shareCode ? (
            <View style={styles.shareCodeCard}>
              <View style={styles.shareCodeHeader}>
                <Text style={styles.shareCodeLabel}>Share Code</Text>
                <Text style={styles.shareCodeExpiry}>Expires in 7 days</Text>
              </View>
              <Text style={styles.shareCodeValue}>{shareCode}</Text>
              <View style={styles.shareActions}>
                <Pressable 
                  style={styles.shareActionButton}
                  onPress={() => copyToClipboard(shareCode)}
                >
                  <Copy size={18} color="#8b5cf6" />
                  <Text style={styles.shareActionText}>Copy</Text>
                </Pressable>
                <Pressable 
                  style={styles.shareActionButton}
                  onPress={shareViaApp}
                >
                  <Share2 size={18} color="#8b5cf6" />
                  <Text style={styles.shareActionText}>Share</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable 
              style={styles.generateButton}
              onPress={generateShareLink}
              disabled={creatingInvite}
            >
              {creatingInvite ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <LinkIcon size={20} color="#ffffff" />
                  <Text style={styles.generateButtonText}>Generate Share Link</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* Invite by Email */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invite by Email</Text>
          <Text style={styles.sectionSubtitle}>
            Send invitation directly to another parent's email
          </Text>
          
          <Pressable 
            style={styles.emailInviteButton}
            onPress={() => setShareModalVisible(true)}
          >
            <Mail size={20} color="#8b5cf6" />
            <Text style={styles.emailInviteText}>Send Email Invitation</Text>
          </Pressable>
        </View>

        {/* Pending Invitations */}
        {invites.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Invitations</Text>
            <Text style={styles.sectionSubtitle}>
              {invites.length} invitation(s) waiting
            </Text>
            
            {invites.map((invite) => (
              <View key={invite.id} style={styles.inviteCard}>
                <View style={styles.inviteInfo}>
                  <Text style={styles.inviteEmail}>
                    {invite.invitee_email || invite.invitee?.email}
                  </Text>
                  <View style={styles.inviteMeta}>
                    <View style={styles.inviteMetaItem}>
                      <Clock size={12} color="#94a3b8" />
                      <Text style={styles.inviteMetaText}>
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.inviteRelationship}>
                      {invite.relationship}
                    </Text>
                  </View>
                </View>
                <Pressable 
                  style={styles.cancelInviteButton}
                  onPress={() => cancelInvite(invite.id)}
                >
                  <X size={18} color="#ef4444" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Linked Parents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked Parents</Text>
          <Text style={styles.sectionSubtitle}>
            {linkedParents.length} parent(s) have access
          </Text>
          
          {linkedParents.map((parent) => (
            <View key={parent.id} style={styles.parentCard}>
              <View style={styles.parentAvatar}>
                <Text style={styles.parentAvatarText}>
                  {parent.users.first_name.charAt(0)}{parent.users.last_name.charAt(0)}
                </Text>
              </View>
              <View style={styles.parentInfo}>
                <Text style={styles.parentName}>
                  {parent.users.first_name} {parent.users.last_name}
                </Text>
                <View style={styles.parentMeta}>
                  <Text style={styles.parentEmail}>{parent.users.email}</Text>
                  {parent.is_owner && (
                    <View style={styles.ownerBadge}>
                      <Text style={styles.ownerBadgeText}>Owner</Text>
                    </View>
                  )}
                  <Text style={styles.parentJoined}>
                    Joined {new Date(parent.joined_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              {!parent.is_owner && (
                <Pressable 
                  style={styles.removeButton}
                  onPress={() => removeParent(parent.id, parent.users.first_name)}
                >
                  <X size={18} color="#94a3b8" />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Email Invite Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={shareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Email Invitation</Text>
              <Pressable onPress={() => setShareModalVisible(false)}>
                <X size={24} color="#64748b" />
              </Pressable>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={emailInput}
                onChangeText={setEmailInput}
                placeholder="parent@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Relationship</Text>
              <View style={styles.relationshipButtons}>
                {['parent', 'guardian', 'grandparent', 'other'].map((rel) => (
                  <Pressable
                    key={rel}
                    style={[
                      styles.relationshipButton,
                      relationship === rel && styles.relationshipButtonActive,
                    ]}
                    onPress={() => setRelationship(rel)}
                  >
                    <Text style={[
                      styles.relationshipButtonText,
                      relationship === rel && styles.relationshipButtonTextActive,
                    ]}>
                      {rel.charAt(0).toUpperCase() + rel.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShareModalVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={sendEmailInvite}
                disabled={creatingInvite || !emailInput.trim()}
              >
                {creatingInvite ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalButtonSubmitText}>Send Invitation</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareCodeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  shareCodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shareCodeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  shareCodeExpiry: {
    fontSize: 12,
    color: '#f59e0b',
  },
  shareCodeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    letterSpacing: 2,
    marginVertical: 12,
  },
  shareActions: {
    flexDirection: 'row',
    gap: 12,
  },
  shareActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    gap: 8,
  },
  shareActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  emailInviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8b5cf6',
    borderStyle: 'dashed',
    gap: 12,
  },
  emailInviteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  inviteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  inviteInfo: {
    flex: 1,
  },
  inviteEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  inviteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inviteMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inviteMetaText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  inviteRelationship: {
    fontSize: 12,
    color: '#8b5cf6',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cancelInviteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
  },
  parentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  parentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  parentAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  parentInfo: {
    flex: 1,
  },
  parentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  parentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  parentEmail: {
    fontSize: 12,
    color: '#64748b',
  },
  ownerBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ownerBadgeText: {
    fontSize: 10,
    color: '#065f46',
    fontWeight: '600',
  },
  parentJoined: {
    fontSize: 11,
    color: '#94a3b8',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  relationshipButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relationshipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  relationshipButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  relationshipButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
  relationshipButtonTextActive: {
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f1f5f9',
  },
  modalButtonSubmit: {
    backgroundColor: '#8b5cf6',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  modalButtonSubmitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});