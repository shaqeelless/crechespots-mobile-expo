import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  QrCode,
  Key,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Users,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface ChildInvite {
  id: string;
  child_id: string;
  share_code: string;
  inviter_id: string;
  invitee_email?: string;
  status: string;
  relationship: string;
  expires_at: string;
  children?: {
    first_name: string;
    last_name: string;
    profile_picture_url: string;
  };
  inviter?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function JoinChildScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [inviteCode, setInviteCode] = useState(code as string || '');
  const [invite, setInvite] = useState<ChildInvite | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [relationship, setRelationship] = useState('parent');

  useEffect(() => {
    if (code) {
      fetchInvite(code as string);
    }
  }, [code]);

  const fetchInvite = async (shareCode: string) => {
    if (!shareCode.trim()) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('child_invites')
        .select(`
          *,
          children(first_name, last_name, profile_picture_url),
          inviter:users!inviter_id(first_name, last_name, email)
        `)
        .eq('share_code', shareCode.trim().toUpperCase())
        .single();

      if (error) throw error;
      
      if (data) {
        // Check if expired
        if (new Date(data.expires_at) < new Date()) {
          await supabase
            .from('child_invites')
            .update({ status: 'expired' })
            .eq('id', data.id);
          
          setInvite({ ...data, status: 'expired' });
        } else {
          setInvite(data);
        }
      } else {
        setInvite(null);
      }
    } catch (error) {
      console.error('Error fetching invite:', error);
      setInvite(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChild = async () => {
    if (!invite || !user) return;
    
    try {
      setSubmitting(true);
      
      // Use the stored procedure to accept the invitation
      const { error } = await supabase.rpc('accept_child_invitation', {
        p_invitation_id: invite.id,
        p_user_id: user.id,
      });

      if (error) throw error;
      
      Alert.alert(
        'Success!',
        `You are now linked to ${invite.children?.first_name}'s profile.`,
        [
          {
            text: 'View Profile',
            onPress: () => router.push(`/children/${invite.child_id}`),
          },
          {
            text: 'Back to Dashboard',
            onPress: () => router.push('/'),
          },
        ]
      );
      
    } catch (error) {
      console.error('Error joining child:', error);
      Alert.alert('Error', 'Failed to join child profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getInviteStatus = () => {
    if (!invite) return 'not_found';
    
    if (invite.status === 'accepted') return 'accepted';
    if (invite.status === 'declined') return 'declined';
    if (invite.status === 'expired') return 'expired';
    if (new Date(invite.expires_at) < new Date()) return 'expired';
    
    return 'valid';
  };

  const renderInviteStatus = () => {
    const status = getInviteStatus();
    
    switch (status) {
      case 'valid':
        return (
          <View style={styles.statusValid}>
            <CheckCircle size={20} color="#22c55e" />
            <Text style={styles.statusValidText}>Valid Invitation</Text>
          </View>
        );
      case 'expired':
        return (
          <View style={styles.statusExpired}>
            <Clock size={20} color="#f59e0b" />
            <Text style={styles.statusExpiredText}>Invitation Expired</Text>
          </View>
        );
      case 'accepted':
        return (
          <View style={styles.statusAccepted}>
            <CheckCircle size={20} color="#22c55e" />
            <Text style={styles.statusAcceptedText}>Already Accepted</Text>
          </View>
        );
      case 'declined':
        return (
          <View style={styles.statusDeclined}>
            <XCircle size={20} color="#ef4444" />
            <Text style={styles.statusDeclinedText}>Invitation Declined</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000000" />
        </Pressable>
        <Text style={styles.headerTitle}>Join Child Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Code Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Share Code</Text>
          <Text style={styles.sectionSubtitle}>
            Enter the 8-character code shared with you
          </Text>
          
          <View style={styles.codeInputContainer}>
            <Key size={20} color="#8b5cf6" />
            <TextInput
              style={styles.codeInput}
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="ABCD1234"
              maxLength={8}
              autoCapitalize="characters"
              editable={!invite}
            />
            <Pressable 
              style={styles.searchButton}
              onPress={() => fetchInvite(inviteCode)}
              disabled={loading || !inviteCode.trim() || invite !== null}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.searchButtonText}>
                  {invite ? 'Change' : 'Search'}
                </Text>
              )}
            </Pressable>
          </View>
          
          <Pressable 
            style={styles.scanButton}
            onPress={() => router.push('/children/scan')}
          >
            <QrCode size={20} color="#8b5cf6" />
            <Text style={styles.scanButtonText}>Scan QR Code</Text>
          </Pressable>
        </View>

        {/* Invite Details */}
        {invite && (
          <View style={styles.section}>
            {renderInviteStatus()}
            
            <View style={styles.childCard}>
              <View style={styles.childAvatar}>
                {invite.children?.profile_picture_url ? (
                  <Image 
                    source={{ uri: invite.children.profile_picture_url }}
                    style={styles.childAvatarImage}
                  />
                ) : (
                  <Text style={styles.childAvatarText}>
                    {invite.children?.first_name?.charAt(0)}
                  </Text>
                )}
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>
                  {invite.children?.first_name} {invite.children?.last_name}
                </Text>
                <Text style={styles.childInvite}>
                  Invited by {invite.inviter?.first_name} {invite.inviter?.last_name}
                </Text>
              </View>
            </View>

            {/* Inviter Info */}
            <View style={styles.inviterCard}>
              <Text style={styles.inviterTitle}>Invitation Details</Text>
              
              <View style={styles.detailRow}>
                <User size={16} color="#64748b" />
                <Text style={styles.detailLabel}>Invited by:</Text>
                <Text style={styles.detailValue}>
                  {invite.inviter?.first_name} {invite.inviter?.last_name}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Mail size={16} color="#64748b" />
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{invite.inviter?.email}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Clock size={16} color="#64748b" />
                <Text style={styles.detailLabel}>Expires:</Text>
                <Text style={styles.detailValue}>
                  {new Date(invite.expires_at).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Users size={16} color="#64748b" />
                <Text style={styles.detailLabel}>Relationship:</Text>
                <Text style={styles.detailValue}>
                  {invite.relationship.charAt(0).toUpperCase() + invite.relationship.slice(1)}
                </Text>
              </View>
            </View>

            {/* Join Button */}
            {getInviteStatus() === 'valid' && (
              <Pressable 
                style={styles.joinButton}
                onPress={handleJoinChild}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <User size={20} color="#ffffff" />
                    <Text style={styles.joinButtonText}>
                      Join as {relationship.charAt(0).toUpperCase() + relationship.slice(1)}
                    </Text>
                  </>
                )}
              </Pressable>
            )}

            {/* Status Message */}
            {getInviteStatus() !== 'valid' && (
              <View style={styles.statusMessage}>
                <Text style={styles.statusMessageText}>
                  {getInviteStatus() === 'expired' && 'This invitation has expired. Please ask for a new one.'}
                  {getInviteStatus() === 'accepted' && 'You have already accepted this invitation.'}
                  {getInviteStatus() === 'declined' && 'This invitation was declined.'}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  codeInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    letterSpacing: 2,
  },
  searchButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8b5cf6',
    borderStyle: 'dashed',
    gap: 8,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  statusValid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  statusValidText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065f46',
  },
  statusExpired: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  statusExpiredText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  statusAccepted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  statusAcceptedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065f46',
  },
  statusDeclined: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  statusDeclinedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
  },
  childCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  childAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  childAvatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  childInvite: {
    fontSize: 14,
    color: '#64748b',
  },
  inviterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  inviterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    marginRight: 8,
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
  },
  joinButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusMessage: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusMessageText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});