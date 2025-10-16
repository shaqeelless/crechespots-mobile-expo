import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Share,
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Plus, BookOpen, Search, MapPin, Heart, MessageCircle, Share as ShareIcon, Bell, Users } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import ArticleCard from '@/components/feed/ArticleCard';
import CreatePostModal from '@/components/feed/CreatePostModal';

interface Creche {
  id: string;
  name: string;
  logo: string;
  suburb: string;
  province: string;
  monthly_price?: number;
  weekly_price?: number;
  price?: number;
  registered: boolean;
  follower_count?: number;
}

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
    province: string;
  };
  users?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    profile_picture_url?: string;
  };
  comment_count?: number;
  user_has_liked?: boolean;
  article_likes?: Array<{
    user_id: string;
  }>;
  article_comments?: Array<{
    id: string;
    article_id: string;
    user_id: string;
    content: string;
    created_at: string;
    users: {
      id: string;
      first_name?: string;
      last_name?: string;
      profile_picture_url?: string;
    };
  }>;
}

// Skeleton Loader Component
const SkeletonLoader = () => (
  <View style={styles.container}>
    {/* Header Skeleton */}
    <View style={styles.header}>
      <View style={[styles.skeleton, {width: 150, height: 24}]} />
      <View style={styles.headerRight}>
        <View style={[styles.skeleton, {width: 44, height: 44, borderRadius: 22, marginRight: 8}]} />
        <View style={[styles.skeleton, {width: 44, height: 44, borderRadius: 22}]} />
      </View>
    </View>

    {/* Tabs Skeleton */}
    <View style={styles.tabsWrapper}>
      <View style={styles.crecheTabsContent}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.skeleton, styles.crecheTabSkeleton]} />
        ))}
      </View>
    </View>

    {/* Filter Skeleton */}
    <View style={styles.filterWrapper}>
      <View style={[styles.skeleton, {width: 60, height: 20}]} />
      <View style={styles.filterOptionsSkeleton}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.skeleton, {width: 60, height: 20}]} />
        ))}
      </View>
    </View>

    {/* Posts Skeleton */}
    {[1, 2, 3].map((i) => (
      <View key={i} style={styles.articleCard}>
        <View style={styles.articleHeader}>
          <View style={styles.userInfoContainer}>
            <View style={[styles.skeleton, {width: 40, height: 40, borderRadius: 20, marginRight: 12}]} />
            <View>
              <View style={[styles.skeleton, {width: 120, height: 16, marginBottom: 4}]} />
              <View style={[styles.skeleton, {width: 80, height: 12}]} />
            </View>
          </View>
          <View style={[styles.skeleton, {width: 60, height: 12}]} />
        </View>
        <View style={[styles.skeleton, {height: 60, marginBottom: 12}]} />
        <View style={[styles.skeleton, {height: 20, width: '40%'}]} />
      </View>
    ))}
  </View>
);

export default function FeedsScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // New state for creche filtering
  const [creches, setCreches] = useState<Creche[]>([]);
  const [selectedCreche, setSelectedCreche] = useState<Creche | null>(null);
  const [showAddCreche, setShowAddCreche] = useState(false);
  const [allCreches, setAllCreches] = useState<Creche[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [postFilter, setPostFilter] = useState<'recent' | 'popular' | 'all'>('recent');
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>({});
  const [sharingArticle, setSharingArticle] = useState(false);

  // Load favorite creches
  const loadFavoriteCreches = useCallback(async (uid: string) => {
    try {
      const { data: favorites, error } = await supabase
        .from('user_favorites')
        .select('creche_id')
        .eq('user_id', uid);

      if (error) throw error;

      const favoriteCrecheIds = favorites?.map(f => f.creche_id) || [];

      if (favoriteCrecheIds.length === 0) {
        setCreches([]);
        setSelectedCreche(null);
        return;
      }

      const { data: crechesData, error: crechesError } = await supabase
        .from('creches')
        .select('id, name, logo, suburb, province, monthly_price, weekly_price, price, registered')
        .in('id', favoriteCrecheIds);

      if (crechesError) throw crechesError;

      const favoriteCreches = crechesData || [];
      setCreches(favoriteCreches);
      setSelectedCreche(current => 
        current && favoriteCreches.find(c => c.id === current.id) ? current : favoriteCreches[0] ?? null
      );

      // Load follower counts
      await loadFollowerCounts(favoriteCrecheIds);
    } catch (error) {
      console.error('Error loading favorite creches:', error);
    }
  }, []);

  // Load all creches for discovery
  const loadAllCreches = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('creches')
        .select('id, name, logo, suburb, province, monthly_price, weekly_price, price, registered')
        .order('name');

      if (error) throw error;
      setAllCreches(data || []);

      // Load follower counts for all creches
      const allIds = data?.map(c => c.id) || [];
      await loadFollowerCounts(allIds);
    } catch (error) {
      console.error('Error loading all creches:', error);
    }
  }, []);

  // Load follower counts
  const loadFollowerCounts = useCallback(async (crecheIds: string[]) => {
    if (crecheIds.length === 0) return;
    
    try {
      const { data: favorites, error } = await supabase
        .from('user_favorites')
        .select('creche_id')
        .in('creche_id', crecheIds);

      if (error) throw error;

      const counts: Record<string, number> = {};
      favorites?.forEach(fav => {
        counts[fav.creche_id] = (counts[fav.creche_id] || 0) + 1;
      });
      
      setFollowerCounts(counts);
    } catch (error) {
      console.error('Error loading follower counts:', error);
    }
  }, []);

  // Load notification count
  const loadNotificationCount = useCallback(async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', uid)
        .eq('is_read', false);
      
      if (!error) {
        setUnreadNotifications(data?.length || 0);
      }
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    loadAllCreches();
  }, [loadAllCreches]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (user?.id) {
        await Promise.all([
          loadFavoriteCreches(user.id),
          loadNotificationCount(user.id),
        ]);
      }

      setTimeout(() => {
        if (mounted) {
          setInitialLoadComplete(true);
          setLoading(false);
        }
      }, 500);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [user?.id, loadFavoriteCreches, loadNotificationCount]);

  // Fetch articles based on selected creche and filter
  const fetchFeedArticles = useCallback(async () => {
    try {
      setLoading(true);

      if (!user) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // If no creche selected, show articles from all favorite creches
      const crecheIds = selectedCreche 
        ? [selectedCreche.id]
        : creches.map(c => c.id);

      if (crecheIds.length === 0) {
        setArticles([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

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
          creches(name, logo, suburb, province),
          users(first_name, last_name, display_name, profile_picture_url)
        `,
          { count: 'exact' }
        )
        .in('creche_id', crecheIds);

      // Apply filters
      if (postFilter === 'popular') {
        query = query.order('hearts', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      query = query.limit(50);

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
  }, [user, selectedCreche, creches, postFilter]);

  useEffect(() => {
    fetchFeedArticles();
  }, [fetchFeedArticles]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.id) {
      await loadFavoriteCreches(user.id);
    }
    await fetchFeedArticles();
    
    // Refresh follower counts
    const allCrecheIds = [...creches.map(c => c.id), ...allCreches.map(c => c.id)];
    await loadFollowerCounts(allCrecheIds);
    
    setRefreshing(false);
  }, [user?.id, selectedCreche, loadFavoriteCreches, fetchFeedArticles, loadFollowerCounts, creches, allCreches]);

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
        creche_id: selectedCreche?.id || null,
        hearts: 0,
      });

      if (error) throw error;

      await fetchFeedArticles();
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const toggleFavorite = useCallback(async (crecheId: string) => {
    if (!user?.id) return;
    
    try {
      const isCurrentlyFavorite = creches.some(c => c.id === crecheId);

      if (isCurrentlyFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('creche_id', crecheId);

        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert([{
            user_id: user.id,
            creche_id: crecheId,
          }]);

        if (error) throw error;
      }

      await loadFavoriteCreches(user.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [user?.id, creches, loadFavoriteCreches]);

  const filteredCreches = useMemo(() => {
    if (!searchQuery.trim()) return allCreches;
    const q = searchQuery.toLowerCase();
    return allCreches.filter(c => c.name.toLowerCase().includes(q));
  }, [allCreches, searchQuery]);

  const getLocationText = (creche: any) => {
    if (!creche) return 'Location not available';
    if (creche.suburb && creche.province) {
      return `${creche.suburb}, ${creche.province}`;
    }
    return creche.suburb || creche.province || 'Location not specified';
  };

  const renderCrecheTab = ({ item }: { item: Creche }) => {
    const selected = selectedCreche?.id === item.id;
    const followerCount = followerCounts[item.id] || 0;
    
    return (
      <Pressable
        onPress={() => setSelectedCreche(item)}
        style={[styles.crecheTab, selected && styles.selectedTab]}
      >
        <View style={styles.crecheTabContent}>
          <Image 
            source={{ uri: item.logo || 'https://crechespots.co.za/brand.png' }} 
            style={styles.crecheTabLogo} 
          />
          <Text style={[styles.crecheTabText, selected && styles.selectedTabText]} numberOfLines={1}>
            {item.name}
          </Text>
          {followerCount > 0 && (
            <Text style={[styles.followerCount, selected && styles.selectedFollowerCount]}>
              {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  if (!initialLoadComplete || loading) {
    return <SkeletonLoader />;
  }

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

  if (showAddCreche) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowAddCreche(false)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Follow Creches</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search creches..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredCreches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.crechesListContent}
          renderItem={({ item: creche }) => {
            const isFavorite = creches.some(c => c.id === creche.id);
            const followerCount = followerCounts[creche.id] || 0;
            
            return (
              <Pressable
                style={[styles.crecheItem, isFavorite && styles.favoriteItem]}
                onPress={() => toggleFavorite(creche.id)}
              >
                <Image 
                  source={{ uri: creche.logo || 'https://crechespots.co.za/brand.png' }} 
                  style={styles.crecheItemLogo} 
                />
                <View style={styles.crecheInfo}>
                  <Text style={styles.crecheItemName}>{creche.name}</Text>
                  <View style={styles.crecheMeta}>
                    <MapPin size={14} color="#666" />
                    <Text style={styles.crecheLocation}>
                      {getLocationText(creche)}
                    </Text>
                    {followerCount > 0 && (
                      <Text style={styles.crecheFollowers}>
                        • {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}>
                  <Text style={[styles.favoriteButtonText, isFavorite && styles.favoriteButtonTextActive]}>
                    {isFavorite ? 'Unfollow' : 'Follow'}
                  </Text>
                </View>
              </Pressable>
            );
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </View>
    );
  }

  if (creches.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Feeds</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notifications')}>
              <Bell size={24} color="#374151" />
              {unreadNotifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>{unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.addIconButton} onPress={() => setShowAddCreche(true)}>
              <Plus size={24} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.emptyState}>
          <BookOpen size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Creches Followed</Text>
          <Text style={styles.emptySubtitle}>Follow creches to see their latest updates and articles</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddCreche(true)}>
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Follow Creches</Text>
          </TouchableOpacity>
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
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notifications')}>
            <Bell size={24} color="#374151" />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Pressable style={styles.createButton} onPress={() => setShowCreateModal(true)}>
            <Plus size={24} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* Creche Tabs */}
      {creches.length > 0 && (
        <View style={styles.tabsWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={creches}
            keyExtractor={(item) => item.id}
            renderItem={renderCrecheTab}
            contentContainerStyle={styles.crecheTabsContent}
            ListHeaderComponent={
              <Pressable
                onPress={() => setSelectedCreche(null)}
                style={[styles.crecheTab, !selectedCreche && styles.selectedTab]}
              >
                <View style={styles.crecheTabContent}>
                  <Users size={20} color={!selectedCreche ? '#ffffff' : '#64748b'} />
                  <Text style={[styles.crecheTabText, !selectedCreche && styles.selectedTabText]}>
                    All
                  </Text>
                </View>
              </Pressable>
            }
          />
        </View>
      )}

      {/* Filter Options */}
      <View style={styles.filterWrapper}>
        <Text style={styles.filterTitle}>Show:</Text>
        <View style={styles.filterOptions}>
          <TouchableOpacity onPress={() => setPostFilter('recent')}>
            <Text style={[styles.filterText, postFilter === 'recent' && styles.activeFilterText]}>
              Recent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPostFilter('popular')}>
            <Text style={[styles.filterText, postFilter === 'popular' && styles.activeFilterText]}>
              Popular
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPostFilter('all')}>
            <Text style={[styles.filterText, postFilter === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </TouchableOpacity>
        </View>
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
            <Text style={styles.emptyTitle}>
              {selectedCreche ? 'No posts from this creche' : 'No feeds yet'}
            </Text>
            <Text style={styles.emptyDescription}>
              {selectedCreche 
                ? 'This creche hasn\'t posted any updates yet.'
                : 'Start favoriting creches to see their latest updates and articles here'
              }
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
        selectedCreche={selectedCreche}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  notificationButton: {
    backgroundColor: '#f3f4f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addIconButton: {
    backgroundColor: '#f3f4f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 44,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  // Tabs
  tabsWrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  crecheTabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  crecheTab: {
    minHeight: 44,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
  },
  selectedTab: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  crecheTabContent: {
    alignItems: 'center',
  },
  crecheTabLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 4,
  },
  crecheTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    maxWidth: 120,
  },
  selectedTabText: {
    color: '#ffffff',
  },
  followerCount: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  selectedFollowerCount: {
    color: '#ffffff',
  },
  // Filter
  filterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 20,
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#2563eb',
    fontWeight: '600',
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
  // Search & Add Creche
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  crechesListContent: {
    padding: 16,
  },
  crecheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  favoriteItem: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  crecheItemLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  crecheInfo: {
    flex: 1,
  },
  crecheItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  crecheMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crecheLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  crecheFollowers: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  favoriteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  favoriteButtonActive: {
    backgroundColor: '#2563eb',
  },
  favoriteButtonText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  favoriteButtonTextActive: {
    color: '#ffffff',
  },
  // Empty States
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
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
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
  // Skeleton styles
  skeleton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  crecheTabSkeleton: {
    minHeight: 36,
    width: 100,
    marginHorizontal: 4,
  },
  filterOptionsSkeleton: {
    flexDirection: 'row',
    gap: 20,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  articleCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
});