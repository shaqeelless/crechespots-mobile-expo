import React from 'react';
import { View, Text, Pressable, Alert, Clipboard, Share } from 'react-native';
import { Users, UserPlus, Mail, Share2 } from 'lucide-react-native';
import { Child, ChildInvite } from '../types';
import { Router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import {
  sharedStyles,
  parentsStyles,
} from '../styles';

interface ParentsSectionProps {
  child: Child;
  invites: ChildInvite[];
  fetchChildInvites: () => Promise<void>;
  router: Router;
  id: string;
}

export default function ParentsSection({
  child,
  invites,
  fetchChildInvites,
  router,
  id,
}: ParentsSectionProps) {
  const handleShareCode = () => {
    if (!child.share_code) return;
    
    Alert.alert(
      'Share Code',
      `Share this code with other parents to link them to ${child.first_name}:`,
      [
        {
          text: 'Copy',
          onPress: () => {
            Clipboard.setString(child.share_code!);
            Alert.alert('Copied', 'Share code copied to clipboard');
          }
        },
        {
          text: 'Share',
          onPress: async () => {
            try {
              await Share.share({
                message: `Join me in managing ${child.first_name}'s profile on CrecheApp! Use this code: ${child.share_code}`,
                title: `Join ${child.first_name}'s profile`
              });
            } catch (error) {
              console.error('Error sharing:', error);
            }
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      Alert.alert(
        'Cancel Invitation',
        'Are you sure you want to cancel this invitation?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              const { error } = await supabase
                .from('child_invites')
                .update({ status: 'cancelled' })
                .eq('id', inviteId);

              if (error) throw error;

              await fetchChildInvites();
              Alert.alert('Success', 'Invitation cancelled');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error cancelling invite:', error);
      Alert.alert('Error', 'Failed to cancel invitation');
    }
  };

  const pendingInvites = invites.filter(invite => invite.status === 'pending');

  return (
    <View style={sharedStyles.section}>
      <View style={sharedStyles.sectionHeader}>
        <View style={parentsStyles.sectionHeaderRow}>
          <View>
            <Text style={sharedStyles.sectionTitle}>Parents & Guardians</Text>
            <Text style={sharedStyles.sectionSubtitle}>
              {child.parents?.length || 0} parent(s) linked • {invites.length} invitation(s)
            </Text>
          </View>
          {child.relationship === 'owner' && (
            <Pressable 
              style={parentsStyles.inviteButton}
              onPress={() => router.push(`/children/${id}/share`)}
            >
              <UserPlus size={20} color="#ffffff" />
              <Text style={parentsStyles.inviteButtonText}>Invite Parent</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Active Parents */}
      <Text style={sharedStyles.subsectionTitle}>Active Parents</Text>
      {child.parents && child.parents.length > 0 ? (
        child.parents.map((parent) => (
          <View key={parent.id} style={parentsStyles.parentCard}>
            <View style={parentsStyles.parentAvatar}>
              <Text style={parentsStyles.parentAvatarText}>
                {parent.users?.first_name?.charAt(0)}{parent.users?.last_name?.charAt(0)}
              </Text>
            </View>
            <View style={parentsStyles.parentInfo}>
              <View style={parentsStyles.parentHeader}>
                <Text style={parentsStyles.parentName}>
                  {parent.users?.first_name} {parent.users?.last_name}
                </Text>
                {parent.user_id === child.user_id && (
                  <View style={parentsStyles.ownerBadge}>
                    <Text style={parentsStyles.ownerBadgeText}>Primary</Text>
                  </View>
                )}
              </View>
              <Text style={parentsStyles.parentRelationship}>
                {parent.relationship} • {parent.is_verified ? 'Verified' : 'Pending'}
              </Text>
              <Text style={parentsStyles.parentContact}>
                <Mail size={12} color="#94a3b8" /> {parent.users?.email}
              </Text>
              <Text style={parentsStyles.parentContact}>
                📱 {parent.users?.phone_number}
              </Text>
              <View style={parentsStyles.permissionsContainer}>
                {parent.permissions?.edit && (
                  <View style={parentsStyles.permissionBadge}>
                    <Text style={parentsStyles.permissionText}>Edit</Text>
                  </View>
                )}
                {parent.permissions?.view && (
                  <View style={parentsStyles.permissionBadge}>
                    <Text style={parentsStyles.permissionText}>View</Text>
                  </View>
                )}
                {parent.permissions?.manage && (
                  <View style={parentsStyles.permissionBadge}>
                    <Text style={parentsStyles.permissionText}>Manage</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={sharedStyles.emptyState}>
          <Users size={48} color="#d1d5db" />
          <Text style={sharedStyles.emptyText}>No parents linked</Text>
        </View>
      )}

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <>
          <Text style={[sharedStyles.subsectionTitle, { marginTop: 24 }]}>
            Pending Invitations
          </Text>
          {pendingInvites.map((invite) => (
            <View key={invite.id} style={parentsStyles.inviteCard}>
              <View style={parentsStyles.inviteHeader}>
                <View style={parentsStyles.inviteInfo}>
                  <Mail size={16} color="#64748b" />
                  <Text style={parentsStyles.inviteEmail}>{invite.invitee_email}</Text>
                </View>
                <View style={[
                  parentsStyles.inviteStatusBadge,
                  { backgroundColor: '#fef3c7' }
                ]}>
                  <Text style={[
                    parentsStyles.inviteStatusText,
                    { color: '#92400e' }
                  ]}>
                    Pending
                  </Text>
                </View>
              </View>
              <Text style={parentsStyles.inviteDetails}>
                Invited as {invite.relationship} • Expires {new Date(invite.expires_at).toLocaleDateString()}
              </Text>
              {child.relationship === 'owner' && (
                <Pressable 
                  style={parentsStyles.cancelInviteButton}
                  onPress={() => handleCancelInvite(invite.id)}
                >
                  <Text style={parentsStyles.cancelInviteText}>Cancel Invitation</Text>
                </Pressable>
              )}
            </View>
          ))}
        </>
      )}

      {/* Share Code Section */}
      {child.relationship === 'owner' && child.share_code && (
        <View style={parentsStyles.shareCard}>
          <View style={parentsStyles.shareHeader}>
            <Share2 size={20} color="#0369a1" />
            <Text style={parentsStyles.shareTitle}>Share Access</Text>
          </View>
          <Text style={parentsStyles.shareCode}>{child.share_code}</Text>
          <Text style={parentsStyles.shareDescription}>
            Share this code with other parents to link them to {child.first_name}'s profile
          </Text>
          <View style={parentsStyles.shareButtons}>
            <Pressable 
              style={[parentsStyles.shareButton, parentsStyles.copyButton]}
              onPress={() => {
                Clipboard.setString(child.share_code);
                Alert.alert('Copied', 'Share code copied to clipboard');
              }}
            >
              <Text style={parentsStyles.shareButtonText}>Copy Code</Text>
            </Pressable>
            <Pressable 
              style={parentsStyles.shareButton}
              onPress={handleShareCode}
            >
              <Share2 size={16} color="#ffffff" />
              <Text style={parentsStyles.shareButtonText}>Share</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}