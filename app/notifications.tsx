import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Calendar,
  Users,
  MessageCircle,
  CreditCard,
  X,
  Filter,
  MoreVertical
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

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
const NotificationSkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.skeletonBackButton} />
        <View style={styles.skeletonHeaderTitle} />
        <View style={styles.skeletonHeaderActions} />
      </View>

      <ScrollView style={styles.content}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.skeletonNotification}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonContent}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonMessage} />
              <View style={styles.skeletonTime} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Notification Item Component
const NotificationItem = ({ 
  notification, 
  onPress,
  onDismiss 
}: { 
  notification: Notification;
  onPress: () => void;
  onDismiss: () => void;
}) => {
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showActions, setShowActions] = useState(false);

  const getNotificationIcon = (type: string) => {
    const iconProps = { size: 20 };
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const notificationColor = getNotificationColor(notification.type);

  return (
    <Animated.View style={[styles.notificationItem, { opacity: fadeAnim }]}>
      <Pressable 
        style={[
          styles.notificationContent,
          !notification.is_read && styles.unreadNotification
        ]}
        onPress={onPress}
      >
        <View style={[styles.notificationIcon, { backgroundColor: `${notificationColor}15` }]}>
          {getNotificationIcon(notification.type)}
        </View>
        
        <View style={styles.notificationText}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>
              {notification.title}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTime(notification.created_at)}
            </Text>
          </View>
          <Text style={styles.notificationMessage}>
            {notification.message}
          </Text>
        </View>

        {!notification.is_read && (
          <View style={[styles.unreadBadge, { backgroundColor: notificationColor }]} />
        )}
      </Pressable>

      <Pressable 
        style={styles.moreButton}
        onPress={() => setShowActions(!showActions)}
      >
        <MoreVertical size={16} color="#9ca3af" />
      </Pressable>

      {showActions && (
        <View style={styles.actionMenu}>
          <Pressable 
            style={styles.actionItem}
            onPress={() => {
              setShowActions(false);
              onPress();
            }}
          >
            <Text style={styles.actionText}>View</Text>
          </Pressable>
          <Pressable 
            style={styles.actionItem}
            onPress={() => {
              setShowActions(false);
              handleDismiss();
            }}
          >
            <Text style={[styles.actionText, styles.dismissText]}>Dismiss</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'application',
          title: 'Application Accepted! 🎉',
          message: 'Great news! Your application for Sunshine Daycare has been accepted. The creche will contact you soon to discuss next steps.',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          metadata: { creche_id: '1', application_id: '1' },
          action_url: '/applications/1'
        },
        {
          id: '2',
          type: 'payment',
          title: 'Payment Confirmed',
          message: 'Your payment of R1,500 has been processed successfully. Receipt #INV-2024-001',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          metadata: { amount: 1500, creche_id: '1' }
        },
        {
          id: '3',
          type: 'reminder',
          title: 'Visit Reminder',
          message: 'Friendly reminder: You have a creche visit scheduled for tomorrow at 10:00 AM at Little Stars Creche.',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          metadata: { visit_date: '2024-01-15T10:00:00Z' }
        },
        {
          id: '4',
          type: 'message',
          title: 'New Message',
          message: 'You have a new message from Little Stars Creche regarding your application.',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          action_url: '/messages'
        },
        {
          id: '5',
          type: 'system',
          title: 'Welcome to CrecheSpots! 👋',
          message: 'Thank you for joining CrecheSpots. Start exploring creches in your area and find the perfect fit for your child.',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    );
  };

  const dismissNotification = async (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, is_read: true }))
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.action_url) {
      router.push(notification.action_url as any);
    } else {
      router.push(`/notification/${notification.id}`);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.is_read;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return <NotificationSkeleton />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadCountBadge}>
                <Text style={styles.unreadCountText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable 
            style={[styles.headerButton, showFilter && styles.headerButtonActive]}
            onPress={() => setShowFilter(!showFilter)}
          >
            <Filter size={20} color={showFilter ? "#bd84f6" : "#374151"} />
          </Pressable>
          {unreadCount > 0 && (
            <Pressable style={styles.headerButton} onPress={markAllAsRead}>
              <CheckCircle size={20} color="#10b981" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Options */}
      {showFilter && (
        <View style={styles.filterContainer}>
          <Pressable 
            style={[
              styles.filterOption,
              filter === 'all' && styles.filterOptionActive
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[
              styles.filterOptionText,
              filter === 'all' && styles.filterOptionTextActive
            ]}>
              All
            </Text>
          </Pressable>
          <Pressable 
            style={[
              styles.filterOption,
              filter === 'unread' && styles.filterOptionActive
            ]}
            onPress={() => setFilter('unread')}
          >
            <View style={styles.filterOptionContent}>
              <Text style={[
                styles.filterOptionText,
                filter === 'unread' && styles.filterOptionTextActive
              ]}>
                Unread
              </Text>
              {unreadCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>
      )}

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#bd84f6']}
            tintColor={'#bd84f6'}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length > 0 ? (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
                onDismiss={() => dismissNotification(notification.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIllustration}>
              <Bell size={64} color="#d1d5db" />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === 'unread' ? 'No Unread Notifications' : 'All Caught Up! 🎉'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread' 
                ? 'You\'re all caught up! New notifications will appear here.'
                : 'You don\'t have any notifications at the moment.'
              }
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  unreadCountBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
  headerButtonActive: {
    backgroundColor: '#fdf2f8',
    borderColor: '#bd84f6',
    borderWidth: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },
  filterOptionActive: {
    backgroundColor: '#fdf2f8',
    borderColor: '#bd84f6',
    borderWidth: 1,
  },
  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#bd84f6',
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  notificationsList: {
    padding: 24,
    gap: 16,
  },
  notificationItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    borderRadius: 16,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#bd84f6',
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 20,
    right: 20,
  },
  moreButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  actionMenu: {
    position: 'absolute',
    top: 40,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
    minWidth: 120,
  },
  actionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  dismissText: {
    color: '#ef4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 48,
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
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Skeleton Styles
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
  skeletonNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e7eb',
    marginRight: 16,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  skeletonMessage: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 6,
    width: '90%',
  },
  skeletonTime: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '40%',
  },
});