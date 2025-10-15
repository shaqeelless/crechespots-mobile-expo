import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Plus, BookOpen } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import ArticleCard from '@/components/ArticleCard';
import CreatePostModal from '@/components/CreatePostModal';

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
  comment_count?: number;
  user_has_liked?: boolean;
}

export default function FeedsScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchFeedArticles();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFeedArticles = async () => {
    try {
      setLoading(true);

      if (!user) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const { data: favorites, error: favError } = await supabase
        .from('user_favorites')
        .select('creche_id')
        .eq('user_id', user.id);

      if (favError) {
        console.error('Error fetching favorites:', favError);
      }

      const favoriteCreches = favorites?.map((f) => f.creche_id) || [];

      let query = supabase
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
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .limit(50);

      if (favoriteCreches.length > 0) {
        query = query.in('creche_id', favoriteCreches);
      }

      const { data: articlesData, error } = await query;

      if (error) throw error;

      const { data: userLikes } = await supabase
        .from('user_likes')
        .select('article_id')
        .eq('user_id', user.id);

      const likedArticleIds = new Set(userLikes?.map((like) => like.article_id) || []);

      const { data: commentCounts } = await supabase
        .from('article_comments')
        .select('article_id')
        .in(
          'article_id',
          articlesData?.map((a) => a.id) || []
        );

      const commentCountMap = new Map<string, number>();
      commentCounts?.forEach((comment) => {
        const count = commentCountMap.get(comment.article_id) || 0;
        commentCountMap.set(comment.article_id, count + 1);
      });

      const enrichedArticles = articlesData?.map((article) => ({
        ...article,
        user_has_liked: likedArticleIds.has(article.id),
        comment_count: commentCountMap.get(article.id) || 0,
      }));

      setArticles(enrichedArticles || []);
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
    if (!user) return;

    try {
      const article = articles.find((a) => a.id === articleId);
      const isLiked = article?.user_has_liked;

      setArticles(
        articles.map((a) =>
          a.id === articleId
            ? {
                ...a,
                user_has_liked: !isLiked,
                hearts: isLiked ? a.hearts - 1 : a.hearts + 1,
              }
            : a
        )
      );

      if (isLiked) {
        const { error } = await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);

        if (error) throw error;

        await supabase.rpc('decrement_article_hearts', { article_id: articleId });
      } else {
        const { error } = await supabase.from('user_likes').insert({
          user_id: user.id,
          article_id: articleId,
        });

        if (error) throw error;

        await supabase.rpc('increment_article_hearts', { article_id: articleId });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      fetchFeedArticles();
    }
  };

  const handleComment = (articleId: string) => {
    router.push(`/article/${articleId}`);
  };

  const handleShare = async (article: Article) => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.content.substring(0, 100)}...`,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const handleCreatePost = async (title: string, content: string, type: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('articles').insert({
        title,
        content,
        type,
        author_id: user.id,
        creche_id: null,
        hearts: 0,
      });

      if (error) throw error;

      await fetchFeedArticles();
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Feeds</Text>
          <Text style={styles.headerSubtitle}>Updates from your favorite creches</Text>
        </View>
        <View style={styles.emptyState}>
          <BookOpen size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Please log in</Text>
          <Text style={styles.emptyDescription}>
            Log in to view feeds and interact with posts
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Feeds</Text>
          <Text style={styles.headerSubtitle}>Updates from your favorite creches</Text>
        </View>
        <Pressable style={styles.createButton} onPress={() => setShowCreateModal(true)}>
          <Plus size={24} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading your feeds...</Text>
          </View>
        ) : articles.length > 0 ? (
          <View style={styles.articlesContainer}>
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <BookOpen size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No feeds yet</Text>
            <Text style={styles.emptyDescription}>
              Start favoriting creches to see their latest updates and articles here
            </Text>
            <Pressable style={styles.exploreButton} onPress={() => router.push('/search')}>
              <Text style={styles.exploreButtonText}>Explore Creches</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
    marginTop: 12,
  },
  articlesContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
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
    backgroundColor: '#2563eb',
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
