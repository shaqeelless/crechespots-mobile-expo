import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Heart, Users } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface Like {
  id: string;
  user_id: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export default function ArticleLikesScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const [articleTitle, setArticleTitle] = useState('');

  useEffect(() => {
    if (id) {
      fetchLikes();
      fetchArticleTitle();
    }
  }, [id]);

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('article_likes')
        .select(`
          id,
          user_id,
          created_at,
          profiles(id, full_name, avatar_url)
        `)
        .eq('article_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLikes(data || []);
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleTitle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('title')
        .eq('id', id)
        .single();

      if (error) throw error;
      setArticleTitle(data?.title || '');
    } catch (error) {
      console.error('Error fetching article title:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <Text style={styles.headerTitle}>Likes</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading likes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Likes</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Article Info */}
      {articleTitle && (
        <View style={styles.articleInfo}>
          <Text style={styles.articleTitle} numberOfLines={2}>
            {articleTitle}
          </Text>
          <View style={styles.likesCount}>
            <Heart size={16} color="#ef4444" fill="#ef4444" />
            <Text style={styles.likesCountText}>
              {likes.length} {likes.length === 1 ? 'like' : 'likes'}
            </Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.content}>
        {likes.length > 0 ? (
          <View style={styles.likesList}>
            {likes.map((like) => (
              <View key={like.id} style={styles.likeItem}>
                <Image 
                  source={{ uri: like.profiles?.avatar_url || 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg' }} 
                  style={styles.userAvatar} 
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {like.profiles?.full_name || 'Anonymous User'}
                  </Text>
                  <Text style={styles.likeTime}>
                    {formatTimeAgo(like.created_at)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Users size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No likes yet</Text>
            <Text style={styles.emptyDescription}>
              Be the first to like this article!
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  placeholder: {
    width: 40,
  },
  articleInfo: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  likesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likesCountText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  likesList: {
    gap: 8,
  },
  likeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  likeTime: {
    fontSize: 14,
    color: '#9ca3af',
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