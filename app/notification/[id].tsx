import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Bell, 
  Calendar,
  Users,
  MessageCircle,
  CreditCard,
  Info,
  ExternalLink,
  Trash2,
  Share
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  type: 'application' | 'payment' | 'system' | 'reminder' | 'message';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
  action_url?: string;
}

// Skeleton Loading Component
const NotificationDetailSkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonBackButton} />
        <View style={styles.skeletonHeaderTitle} />
        <View style={styles.skeletonHeaderActions} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonMessage} />
        <View style={styles.skeletonTime} />
        <View style={styles.skeletonActions} />
      </ScrollView>
    </View>
  );
};

export default function NotificationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const notificationId = params.id as string;

  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedNotifications, setRelatedNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchNotificationDetails();
  }, [notificationId]);

  const fetchNotificationDetails = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockNotification: Notification = {
        id: notificationId,
        type: 'application',
        title: 'Application Accepted! 🎉',
        message: 'Great news! Your application for Sunshine Daycare has been accepted. The creche administrator has reviewed your application and is excited to welcome your child.\n\nNext steps:\n• The creche will contact you within 24 hours\n• You can schedule an orientation visit\n• Complete the enrollment paperwork\n• Make the first payment to secure the spot\n\nIf you have any questions, please don\'t hesitate to contact the creche directly.',
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        metadata: { 
          creche_id: '1', 
          application_id: '1',
          creche_name: 'Sunshine Daycare',
          contact_email: 'hello@sunshinedaycare.co.za',
          contact_phone: '+27 11 123 4567'
        },
        action_url: '/applications/1'
      };

      const mockRelated: Notification[] = [
        {
          id: '2',
          type: 'application',
          title: 'Application Submitted',
          message: 'Your application for Sunshine Daycare has been submitted successfully.',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        }
      ];

      setNotification(mockNotification);
      setRelatedNotifications(mockRelated);
    } catch (error) {
      console.error('Error fetching notification details:', error);
      Alert.alert('Error', 'Failed to load notification details');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconProps = { size: 32 };
    switch (type) {
      case 'application':
        return <Users {...iconProps} color="#3b82f6" />;
      case 'payment':
        return <CreditCard {...iconProps} color="#10b981" />;
      case 'system':
        return <Info {...iconProps} color="#6b7280" />;
      case 'reminder':
        return <Calendar {...iconProps} color="#f59e0b" />;
      case 'message':
        return <MessageCircle {...iconProps} color="#8b5cf6" />;
      default:
        return <Bell {...iconProps} color="#6b7280" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'application':
        return '#3b82f6';
      case 'payment':
        return '#10b981';
      case 'system':
        return '#6b7280';
      case 'reminder':
        return '#f59e0b';
      case 'message':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAction = () => {
    if (notification?.action_url) {
      router.push(notification.action_url as any);
    }
  };

  const handleContact = (type: 'email' | 'phone') => {
    if (!notification?.metadata) return;

    if (type === 'email' && notification.metadata.contact_email) {
      Linking.openURL(`mailto:${notification.metadata.contact_email}`);
    } else if (type === 'phone' && notification.metadata.contact_phone) {
      Linking.openURL(`tel:${notification.metadata.contact_phone}`);
    }
  };

  const handleShare = async () => {
    // In a real app, you would use the Share API
    Alert.alert('Share', 'Share functionality would be implemented here');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  };

  if (loading) {
    return <NotificationDetailSkeleton />;
  }

  if (!notification) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Notification not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const notificationColor = getNotificationColor(notification.type);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton} onPress={handleShare}>
            <Share size={20} color="#374151" />
          </Pressable>
          <Pressable style={styles.headerButton} onPress={handleDelete}>
            <Trash2 size={20} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Header */}
        <View style={styles.notificationHeader}>
          <View style={[styles.notificationIcon, { backgroundColor: `${notificationColor}15` }]}>
            {getNotificationIcon(notification.type)}
          </View>
          <View style={styles.notificationMeta}>
            <Text style={styles.notificationType}>
              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)} Notification
            </Text>
            <Text style={styles.notificationDate}>
              {formatDate(notification.created_at)}
            </Text>
          </View>
        </View>

        {/* Notification Content */}
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>
            {notification.title}
          </Text>
          <Text style={styles.notificationMessage}>
            {notification.message}
          </Text>
        </View>

        {/* Action Buttons */}
        {notification.action_url && (
          <View style={styles.actionSection}>
            <Text style={styles.actionTitle}>Quick Actions</Text>
            <Pressable style={styles.primaryButton} onPress={handleAction}>
              <Text style={styles.primaryButtonText}>
                {notification.type === 'application' ? 'View Application' :
                 notification.type === 'payment' ? 'View Payment Details' :
                 notification.type === 'message' ? 'View Message' : 'View Details'}
              </Text>
              <ExternalLink size={18} color="#ffffff" />
            </Pressable>
          </View>
        )}

        {/* Contact Information 
        {notification.metadata?.contact_email || notification.metadata?.contact_phone ? (
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.contactButtons}>
              {notification.metadata.contact_email && (
                <Pressable 
                  style={styles.secondaryButton}
                  onPress={() => handleContact('email')}
                >
                  <Text style={styles.secondaryButtonText}>Email Creche</Text>
                </Pressable>
              )}
              {notification.metadata.contact_phone && (
                <Pressable 
                  style={styles.secondaryButton}
                  onPress={() => handleContact('phone')}
                >
                  <Text style={styles.secondaryButtonText}>Call Creche</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}*/}

        {/* Related Notifications */}
        {relatedNotifications.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Related Notifications</Text>
            {relatedNotifications.map((related) => (
              <Pressable 
                key={related.id}
                style={styles.relatedItem}
                onPress={() => router.push(`/notification/${related.id}`)}
              >
                <View style={styles.relatedContent}>
                  <Text style={styles.relatedTitle}>{related.title}</Text>
                  <Text style={styles.relatedTime}>
                    {formatDate(related.created_at)}
                  </Text>
                </View>
                <ArrowLeft size={16} color="#9ca3af" style={{ transform: [{ rotate: '180deg' }] }} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  headerTitle: {
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
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationMeta: {
    flex: 1,
  },
  notificationType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationDate: {
    fontSize: 14,
    color: '#9ca3af',
  },
  notificationContent: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 32,
  },
  notificationMessage: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  actionSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#bd84f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  relatedSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  relatedContent: {
    flex: 1,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  relatedTime: {
    fontSize: 14,
    color: '#9ca3af',
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
  // Skeleton Styles
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  skeletonHeaderActions: {
    width: 88,
    height: 40,
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
  },
  skeletonIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e5e7eb',
    alignSelf: 'center',
    marginBottom: 24,
  },
  skeletonTitle: {
    height: 28,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
    width: '80%',
    alignSelf: 'center',
  },
  skeletonMessage: {
    height: 100,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
    width: '100%',
  },
  skeletonTime: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 24,
    width: '60%',
    alignSelf: 'center',
  },
  skeletonActions: {
    height: 52,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    width: '100%',
  },
});