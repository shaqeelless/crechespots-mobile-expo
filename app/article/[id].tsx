import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Share as ShareRN,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, Share2, Clock, MapPin } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import CommentSection from '@/components/CommentSection';

interface Article {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  hearts: number;
  creche_id: string;
  author_id: string;
  creches?: {
    name: string;
    logo: string;
    suburb?: string;
    city?: string;
  };
  users?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    profile_picture_url?: string;
  };
}

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchArticleDetails();
    if (user) {
      checkIfLiked();
    }
  }, [id, user]);

  const fetchArticleDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select(
          `
          id,
          title,
          content,
          type,
          created_at,
          hearts,
          creche_id,
          author_id,
          creches(name, logo, suburb, city),
          users(first_name, last_name, display_name, profile_picture_url)
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      setArticle(data);
      setLikeCount(data.hearts || 0);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', id)
        .maybeSingle();

      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      if (isLiked) {
        await supabase.from('user_likes').delete().eq('user_id', user.id).eq('article_id', id);

        const { error } = await supabase
          .from('articles')
          .update({ hearts: Math.max(0, likeCount - 1) })
          .eq('id', id);

        if (error) throw error;
      } else {
        await supabase.from('user_likes').insert({
          user_id: user.id,
          article_id: id,
        });

        const { error } = await supabase
          .from('articles')
          .update({ hearts: likeCount + 1 })
          .eq('id', id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };

  const handleShare = async () => {
    if (!article) return;

    try {
      await ShareRN.share({
        message: `${article.title}\n\n${article.content}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getCategoryColor = (type: string) => {
    const colors: Record<string, string> = {
      news: '#f68484',
      events: '#9cdcb8',
      tips: '#84a7f6',
      activities: '#f6cc84',
      announcements: '#2563eb',
      safety: '#f684a3',
      update: '#9cdcb8',
      article: '#84a7f6',
    };
    return colors[type?.toLowerCase()] || '#2563eb';
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
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Article not found</Text>
        <Pressable style={styles.backButtonAlt} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const authorName =
    article.users?.display_name ||
    `${article.users?.first_name || ''} ${article.users?.last_name || ''}`.trim() ||
    article.creches?.name ||
    'Anonymous';

  const authorImage =
    article.users?.profile_picture_url ||
    article.creches?.logo ||
    'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Article</Text>
        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Share2 size={20} color="#374151" />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.articleHeader}>
          <Image source={{ uri: authorImage }} style={styles.authorAvatar} />
          <View style={styles.headerInfo}>
            <Text style={styles.authorName}>{authorName}</Text>
            {article.creches?.suburb && (
              <View style={styles.locationRow}>
                <MapPin size={12} color="#9ca3af" />
                <Text style={styles.location}>
                  {article.creches.suburb}
                  {article.creches?.city ? `, ${article.creches.city}` : ''}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#9ca3af" />
            <Text style={styles.timeAgo}>{formatTimeAgo(article.created_at)}</Text>
          </View>
        </View>

        {article.type && (
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(article.type) }]}>
            <Text style={styles.categoryText}>{article.type.toUpperCase()}</Text>
          </View>
        )}

        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.articleContent}>{article.content}</Text>

        <View style={styles.engagementRow}>
          <Pressable style={styles.likeButton} onPress={handleLike}>
            <Heart size={24} color="#ef4444" fill={isLiked ? '#ef4444' : 'transparent'} />
            <Text style={styles.likeText}>{likeCount}</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <CommentSection articleId={id as string} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
  },
  headerInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: '#9ca3af',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 20,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
    paddingHorizontal: 20,
    lineHeight: 32,
  },
  articleContent: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  engagementRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  likeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  divider: {
    height: 8,
    backgroundColor: '#f4fcfe',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 20,
  },
  backButtonAlt: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
