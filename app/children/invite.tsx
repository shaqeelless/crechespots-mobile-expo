import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Mail, Send, Users } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

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
        {/* Info Section Skeleton */}
        <View style={styles.skeletonInfoSection}>
          <View style={styles.skeletonIconContainer} />
          <View style={styles.skeletonInfoTitle} />
          <View style={styles.skeletonDescription}>
            <View style={styles.skeletonDescriptionLine} />
            <View style={styles.skeletonDescriptionLine} />
            <View style={styles.skeletonDescriptionLineShort} />
          </View>
        </View>

        {/* Form Section Skeleton */}
        <View style={styles.skeletonForm}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonInputContainer} />
          <View style={styles.skeletonMessageContainer}>
            <View style={styles.skeletonMessageLabel} />
            <View style={styles.skeletonMessageInput} />
          </View>
        </View>

        {/* Warning Section Skeleton */}
        <View style={styles.skeletonWarningSection}>
          <View style={styles.skeletonWarningTitle} />
          <View style={styles.skeletonWarningText} />
          <View style={styles.skeletonWarningText} />
          <View style={styles.skeletonWarningText} />
          <View style={styles.skeletonWarningText} />
        </View>

        {/* Submit Button Skeleton */}
        <View style={styles.skeletonSubmitSection}>
          <View style={styles.skeletonSubmitButton} />
        </View>
      </ScrollView>
    </View>
  );
};

export default function InviteParentScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  // Simulate data loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDataLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendInvite = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!user || !profile) {
      Alert.alert('Error', 'You must be logged in to send invites');
      return;
    }

    try {
      setLoading(true);
      
      // Check if user exists
      const { data: invitedUser, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('email', email.toLowerCase())
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // Create invitation record
      const inviteData = {
        child_id: childId,
        inviter_id: user.id,
        inviter_name: `${profile.first_name} ${profile.last_name}`,
        invited_email: email.toLowerCase(),
        invited_user_id: invitedUser?.id || null,
        message: message || `${profile.first_name} ${profile.last_name} has invited you to be linked as a parent to their child's profile on CrecheSpots.`,
        status: 'pending',
      };

      const { error: inviteError } = await supabase
        .from('parent_invitations')
        .insert([inviteData]);

      if (inviteError) throw inviteError;

      // Send notification if user exists
      if (invitedUser) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([
            {
              user_id: invitedUser.id,
              title: 'Parent Invitation',
              message: `${profile.first_name} ${profile.last_name} has invited you to be linked as a parent to their child's profile.`,
              sender_id: user.id,
            },
          ]);

        if (notificationError) {
          console.error('Error sending notification:', notificationError);
        }
      }

      Alert.alert(
        'Invitation Sent!',
        invitedUser 
          ? 'The parent invitation has been sent successfully. They will receive a notification in the app.'
          : 'An invitation email has been sent. If they don\'t have an account, they\'ll be prompted to create one.',
        [{ text: 'OK', onPress: () => router.back() }]
      );

    } catch (error) {
      console.error('Error sending invite:', error);
      Alert.alert('Error', 'Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return <SkeletonLoader />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Invite Parent</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoSection}>
          <View style={styles.iconContainer}>
            <Users size={48} color="#bd84f6" />
          </View>
          <Text style={styles.infoTitle}>Link Another Parent</Text>
          <Text style={styles.infoDescription}>
            Invite another parent or guardian to be linked to this child's profile. 
            They'll be able to view applications and receive updates about this child.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Invitation Details</Text>
          
          <View style={styles.inputContainer}>
            <Mail size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Parent's Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>Personal Message (Optional)</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Add a personal message to your invitation..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.warningSection}>
          <Text style={styles.warningTitle}>Important Notes:</Text>
          <Text style={styles.warningText}>• Both parents will have equal access to the child's profile</Text>
          <Text style={styles.warningText}>• Both parents can submit applications for this child</Text>
          <Text style={styles.warningText}>• Both parents will receive notifications about applications</Text>
          <Text style={styles.warningText}>• You can remove linked parents at any time</Text>
        </View>

        {/* Send Button */}
        <View style={styles.submitSection}>
          <Pressable 
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSendInvite}
            disabled={loading}
          >
            <Send size={20} color="#ffffff" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Sending Invitation...' : 'Send Invitation'}
            </Text>
          </Pressable>
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
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
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
    marginTop: 8,
  },
  messageLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  messageInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#374151',
    minHeight: 80,
  },
  warningSection: {
    backgroundColor: '#fef3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 4,
    lineHeight: 20,
  },
  submitSection: {
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: '#bd84f6',
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
    width: 120,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonPlaceholder: {
    width: 40,
  },
  skeletonInfoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  skeletonIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  skeletonInfoTitle: {
    width: 160,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonDescription: {
    width: '100%',
    gap: 8,
  },
  skeletonDescriptionLine: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '100%',
  },
  skeletonDescriptionLineShort: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '60%',
  },
  skeletonForm: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  skeletonSectionTitle: {
    width: '50%',
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonInputContainer: {
    height: 52,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 16,
  },
  skeletonMessageContainer: {
    marginTop: 8,
  },
  skeletonMessageLabel: {
    width: '40%',
    height: 18,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonMessageInput: {
    height: 100,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  skeletonWarningSection: {
    backgroundColor: '#fef3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  skeletonWarningTitle: {
    width: '40%',
    height: 18,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonWarningText: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    width: '90%',
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