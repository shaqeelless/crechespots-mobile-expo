import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { MessageCircle, Clock } from 'lucide-react-native';

const conversations = [
  {
    id: 1,
    crecheName: 'Little Learners Academy',
    lastMessage: 'Thank you for your booking confirmation. We look forward to welcoming your child!',
    timestamp: '2 min ago',
    unread: true,
    avatar: 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg',
  },
  {
    id: 2,
    crecheName: 'Sunshine Daycare',
    lastMessage: 'Our visit slots for next week are now available. Would you like to schedule one?',
    timestamp: '1 hour ago',
    unread: false,
    avatar: 'https://images.pexels.com/photos/8535334/pexels-photo-8535334.jpeg',
  },
  {
    id: 3,
    crecheName: 'Happy Kids Center',
    lastMessage: 'We have received your application and will review it within 24 hours.',
    timestamp: 'Yesterday',
    unread: false,
    avatar: 'https://images.pexels.com/photos/8613012/pexels-photo-8613012.jpeg',
  },
];

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Chat with childcare providers</Text>
      </View>

      <ScrollView style={styles.content}>
        {conversations.map((conversation) => (
          <Pressable key={conversation.id} style={styles.conversationItem}>
            <Image source={{ uri: conversation.avatar }} style={styles.avatar} />
            
            <View style={styles.conversationContent}>
              <View style={styles.conversationHeader}>
                <Text style={styles.crecheName}>{conversation.crecheName}</Text>
                <Text style={styles.timestamp}>{conversation.timestamp}</Text>
              </View>
              
              <Text style={[
                styles.lastMessage,
                { fontWeight: conversation.unread ? '600' : '400' }
              ]}>
                {conversation.lastMessage}
              </Text>
            </View>
            
            {conversation.unread && <View style={styles.unreadBadge} />}
          </Pressable>
        ))}
        
        {conversations.length === 0 && (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyDescription}>
              Start exploring creches and connect with providers to see your conversations here
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
    backgroundColor: '#f4fcfe',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  crecheName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  unreadBadge: {
    position: 'absolute',
    right: 16,
    top: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bd4ab5',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});