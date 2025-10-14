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
import { Heart, Share2, Clock, MapPin, ArrowLeft, Users } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

interface Article {
  id: string;
  title: string;
  content: string;
  type: string;
  author_id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  hearts: number;
  creche_id: string;
  creches: {
    name: string;
    logo: string;
    suburb: string;
    province?: string;
  };
}

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

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState<Like[]>([]);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticle();
      fetchLikes();
      checkIfLiked();
    }
  }, [id, user]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          content,
          type,
          author_id,
          latitude,
          longitude,
          created_at,
          updated_at,
          hearts,
          creche_id,
          creches(name, logo, suburb, province)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const checkIfLiked = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('article_likes')
        .select('id')
        .eq('article_id', id)
        .eq('user_id', user.id)
        .single();

      setHasLiked(!!data);
    } catch (error) {
      setHasLiked(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      // Optionally redirect to login
      return;
    }

    try {
      if (hasLiked) {
        // Unlike
        const { error } = await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setHasLiked(false);
        setLikes(likes.filter(like => like.user_id !== user.id));
        
        // Update hearts count in articles table
        if (article) {
          const newHearts = Math.max(0, article.hearts - 1);
          const { error: updateError } = await supabase
            .from('articles')
            .update({ hearts: newHearts })
            .eq('id', id);

          if (!updateError) {
            setArticle({
              ...article,
              hearts: newHearts
            });
          }
        }
      } else {
        // Like
        const { error } = await supabase
          .from('article_likes')
          .insert({
            article_id: id,
            user_id: user.id,
          });

        if (error) throw error;
        
        setHasLiked(true);
        
        // Add to likes list
        if (user) {
          const newLike: Like = {
            id: `temp-${Date.now()}`,
            user_id: user.id,
            created_at: new Date().toISOString(),
            profiles: {
              id: user.id,
              full_name: 'You', // You can get this from user profile
              avatar_url: ''
            }
          };
          setLikes([newLike, ...likes]);
        }
        
        // Update hearts count in articles table
        if (article) {
          const newHearts = (article.hearts || 0) + 1;
          const { error: updateError } = await supabase
            .from('articles')
            .update({ hearts: newHearts })
            .eq('id', id);

          if (!updateError) {
            setArticle({
              ...article,
              hearts: newHearts
            });
          }
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async () => {
    // Implement share functionality
    console.log('Share article:', article?.title);
  };

  const handleViewLikes = () => {
    router.push(`/article/${id}/likes`);
  };

  const getCategoryColor = (type: string) => {
    const colors: Record<string, string> = {
      'helpful': '#84a7f6',
      'events': '#9cdcb8',
      'donation': '#f68484',
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

  const getLocationText = (creche: any) => {
    if (!creche) return 'Location not available';
    
    if (creche.suburb && creche.province) {
      return `${creche.suburb}, ${creche.province}`;
    }
    if (creche.suburb) {
      return creche.suburb;
    }
    if (creche.province) {
      return creche.province;
    }
    return 'Location not specified';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <Text style={styles.headerTitle}>Article</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading article...</Text>
        </View>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <Text style={styles.headerTitle}>Article</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Article not found</Text>
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
        <Text style={styles.headerTitle}>Article</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Article Header */}
        <View style={styles.articleHeader}>
          <Image 
            source={{ uri: article.creches?.logo || 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg' }} 
            style={styles.crecheAvatar} 
          />
          <View style={styles.headerInfo}>
            <Text style={styles.crecheName}>{article.creches?.name}</Text>
            {article.creches && (
              <View style={styles.locationRow}>
                <MapPin size={12} color="#9ca3af" />
                <Text style={styles.location}>
                  {getLocationText(article.creches)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#9ca3af" />
            <Text style={styles.timeAgo}>{formatTimeAgo(article.created_at)}</Text>
          </View>
        </View>

        {/* Category Badge */}
        {article.type && (
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(article.type) }]}>
            <Text style={styles.categoryText}>{article.type.toUpperCase()}</Text>
          </View>
        )}

        {/* Article Content */}
        <Text style={styles.articleTitle}>{article.title}</Text>
        <Text style={styles.articleContent}>
          {article.content}
        </Text>

        {/* Engagement Row */}
        <View style={styles.engagementRow}>
          <Pressable
            style={styles.engagementButton}
            onPress={handleLike}
          >
            <Heart 
              size={20} 
              color="#ef4444" 
              fill={hasLiked ? "#ef4444" : "transparent"} 
            />
            <Text style={styles.engagementText}>{article.hearts || 0}</Text>
          </Pressable>

          <Pressable
            style={styles.engagementButton}
            onPress={handleViewLikes}
          >
            <Users size={20} color="#6b7280" />
            <Text style={styles.engagementText}>View Likes</Text>
          </Pressable>

          <Pressable
            style={styles.engagementButton}
            onPress={handleShare}
          >
            <Share2 size={20} color="#6b7280" />
            <Text style={styles.engagementText}>Share</Text>
          </Pressable>
        </View>

        {/* Recent Likes Preview */}
        {likes.length > 0 && (
          <View style={styles.likesPreview}>
            <Text style={styles.likesPreviewTitle}>Recent Likes</Text>
            {likes.slice(0, 3).map((like) => (
              <View key={like.id} style={styles.likeItem}>
                <Image 
                  source={{ uri: like.profiles?.avatar_url || 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg' }} 
                  style={styles.userAvatar} 
                />
                <Text style={styles.userName}>
                  {like.profiles?.full_name || 'Anonymous User'}
                </Text>
              </View>
            ))}
            {likes.length > 3 && (
              <Pressable onPress={handleViewLikes} style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>
                  View all {likes.length} likes
                </Text>
              </Pressable>
            )}
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  crecheAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  crecheName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#9ca3af',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeAgo: {
    fontSize: 14,
    color: '#9ca3af',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
    lineHeight: 32,
  },
  articleContent: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#f3f4f6',
    borderBottomColor: '#f3f4f6',
    marginBottom: 24,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  engagementText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  likesPreview: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  likesPreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  likeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
});