import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  RefreshControl,
} from 'react-native';
import { BookOpen, Heart, MessageCircle, Share2, Clock, MapPin } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  creche_id: string;
  creches: {
    name: string;
    logo: string;
    suburb: string;
    city: string;
  };
}

export default function FeedsScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchFeedArticles();
  }, [user]);

  const fetchFeedArticles = async () => {
    try {
      setLoading(true);
      
      // Get user's favorite creches first
      const { data: favorites, error: favError } = await supabase
        .from('user_favorites')
        .select('creche_id')
        .eq('user_id', user?.id);

      if (favError) throw favError;

      const favoriteCreches = favorites?.map(f => f.creche_id) || [];

      // If no favorites, get articles from all creches
      let query = supabase
        .from('articles')
        .select(`
          *,
          creches(name, logo, suburb, city)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      // If user has favorites, filter by those creches
      if (favoriteCreches.length > 0) {
        query = query.in('creche_id', favoriteCreches);
      }

      const { data, error } = await query;

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching feed articles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedArticles();
  };

  const handleLike = async (articleId: string) => {
    // Implement like functionality
    console.log('Like article:', articleId);
  };

  const handleShare = async (article: Article) => {
    // Implement share functionality
    console.log('Share article:', article.title);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'news': '#f68484',
      'events': '#9cdcb8',
      'tips': '#84a7f6',
      'activities': '#f6cc84',
      'announcements': '#bd84f6',
      'safety': '#f684a3',
    };
    return colors[category.toLowerCase()] || '#bd4ab5';
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

  const renderArticle = (article: Article) => (
    <View key={article.id} style={styles.articleCard}>
      {/* Article Header */}
      <View style={styles.articleHeader}>
        <Image 
          source={{ uri: article.creches?.logo || 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg' }} 
          style={styles.crecheAvatar} 
        />
        <View style={styles.headerInfo}>
          <Text style={styles.crecheName}>{article.creches?.name}</Text>
          <View style={styles.locationRow}>
            <MapPin size={12} color="#9ca3af" />
            <Text style={styles.location}>
              {article.creches?.suburb}, {article.creches?.city}
            </Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Clock size={12} color="#9ca3af" />
          <Text style={styles.timeAgo}>{formatTimeAgo(article.created_at)}</Text>
        </View>
      </View>

      {/* Category Badge */}
      <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(article.category) }]}>
        <Text style={styles.categoryText}>{article.category.toUpperCase()}</Text>
      </View>

      {/* Article Content */}
      <Text style={styles.articleTitle}>{article.title}</Text>
      <Text style={styles.articleContent} numberOfLines={3}>
        {article.content}
      </Text>

      {/* Article Image */}
      {article.image_url && (
        <Image source={{ uri: article.image_url }} style={styles.articleImage} />
      )}

      {/* Engagement Row */}
      <View style={styles.engagementRow}>
        <Pressable 
          style={styles.engagementButton}
          onPress={() => handleLike(article.id)}
        >
          <Heart size={18} color="#ef4444" />
          <Text style={styles.engagementText}>{article.likes_count || 0}</Text>
        </Pressable>

        <Pressable style={styles.engagementButton}>
          <MessageCircle size={18} color="#6b7280" />
          <Text style={styles.engagementText}>{article.comments_count || 0}</Text>
        </Pressable>

        <Pressable 
          style={styles.engagementButton}
          onPress={() => handleShare(article)}
        >
          <Share2 size={18} color="#6b7280" />
          <Text style={styles.engagementText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Feeds</Text>
        <Text style={styles.headerSubtitle}>
          Updates from your favorite creches
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your feeds...</Text>
          </View>
        ) : articles.length > 0 ? (
          <View style={styles.articlesContainer}>
            {articles.map(renderArticle)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <BookOpen size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No feeds yet</Text>
            <Text style={styles.emptyDescription}>
              Start favoriting creches to see their latest updates and articles here
            </Text>
            <Pressable style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>Explore Creches</Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  articlesContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  articleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  crecheAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  crecheName: {
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
  articleContent: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  articleImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  engagementText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
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
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#bd4ab5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});