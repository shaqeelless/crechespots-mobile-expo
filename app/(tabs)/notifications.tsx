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
  Filter,
  MoreVertical,
  User
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Notification {
  id: string;
  type: 'application' | 'payment' | 'system' | 'reminder' | 'message' | 'announcement' | 'attendance';
  title: string;
  message: string;
  read_at: string | null; // Changed from is_read boolean
  created_at: string;
  metadata?: any;
  action_url?: string;
  user_id: string;
  sender_id?: string;
  deleted?: boolean;
}

// Helper function to determine notification type based on content
const determineNotificationType = (notification: any): Notification['type'] => {
  const title = notification.title?.toLowerCase() || '';
  const message = notification.message?.toLowerCase() || '';

  if (title.includes('application') || message.includes('application')) {
    return 'application';
  }
  if (title.includes('payment') || message.includes('payment')) {
    return 'payment';
  }
  if (title.includes('reminder') || message.includes('reminder')) {
    return 'reminder';
  }
  if (title.includes('message') || message.includes('message')) {
    return 'message';
  }
  if (title.includes('announcement') || message.includes('announcement')) {
    return 'announcement';
  }
  if (title.includes('attendance') || message.includes('attendance')) {
    return 'attendance';
  }
  return 'system';
};

// Skeleton Loading Component
const NotificationSkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => {}}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          <View style={styles.headerButtonPlaceholder} />
        </View>
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
      case 'announcement':
        return <AlertCircle {...iconProps} color="#f59e0b" />;
      case 'attendance':
        return <CheckCircle {...iconProps} color="#10b981" />;
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
      case 'announcement':
        return '#f59e0b';
      case 'attendance':
        return '#10b981';
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

  const isRead = !!notification.read_at;
  const notificationColor = getNotificationColor(notification.type);

  return (
    <Animated.View style={[styles.notificationItem, { opacity: fadeAnim }]}>
      <Pressable 
        style={[
          styles.notificationContent,
          !isRead && styles.unreadNotification
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

        {!isRead && (
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
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch notifications from your notifications table
      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:users!sender_id(first_name, last_name)
        `)
        .eq('user_id', user.id)
        .eq('deleted', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        // If no notifications found, show empty state
        setNotifications([]);
      } else {
        // Process notifications and determine their types
        const processedNotifications = (notificationsData || []).map(notification => ({
          ...notification,
          type: determineNotificationType(notification)
        }));
        setNotifications(processedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
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
    if (!user) return;
    
    try {
      // Update in database first
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Then update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId 
            ? { ...notif, read_at: new Date().toISOString() } 
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    if (!user) return;
    
    try {
      // Soft delete by marking as deleted
      const { error } = await supabase
        .from('notifications')
        .update({ deleted: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error dismissing notification:', error);
        return;
      }

      // Remove from local state
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      // Get all unread notification IDs
      const unreadNotifications = notifications.filter(n => !n.read_at);
      const notificationIds = unreadNotifications.map(n => n.id);

      if (notificationIds.length === 0) return;

      // Update all unread notifications in database
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', notificationIds)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking all as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif => 
          !notif.read_at 
            ? { ...notif, read_at: new Date().toISOString() } 
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Only mark as read if it's not already read
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      router.push(notification.action_url as any);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.read_at;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;

  if (loading) {
    return <NotificationSkeleton />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
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

        <View style={styles.headerActions}>
          <Pressable 
            style={[styles.headerButton, showFilter && styles.headerButtonActive]}
            onPress={() => setShowFilter(!showFilter)}
          >
            <Filter size={20} color={showFilter ? "#8b5cf6" : "#374151"} />
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
            colors={['#8b5cf6']}
            tintColor={'#8b5cf6'}
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
            <Pressable 
              style={styles.retryButton}
              onPress={fetchNotifications}
            >
              <Text style={styles.retryButtonText}>Refresh</Text>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  headerButtonPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  headerButtonActive: {
    backgroundColor: '#f3f4f6',
    borderColor: '#8b5cf6',
    borderWidth: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
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
    backgroundColor: '#f3f4f6',
    borderColor: '#8b5cf6',
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
    color: '#8b5cf6',
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
    padding: 20,
    gap: 12,
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
    padding: 16,
    borderRadius: 16,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
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
    top: 16,
    right: 16,
  },
  moreButton: {
    position: 'absolute',
    top: 12,
    right: 12,
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
  retryButton: {
    marginTop: 24,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Skeleton Styles
  skeletonNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
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