import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  RefreshControl,
  Image,
  Pressable,
  Share as RNShare,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle, Plus, Search, MapPin, Bell, ArrowLeft, Share, Clock, BookOpen, Users } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

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
  creches: {
    name: string;
    logo: string;
    suburb: string;
    province?: string;
  };
  article_likes: Array<{
    user_id: string;
  }>;
  article_comments: Array<{
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
  }>;
}

// Skeleton Loader Components
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
      <View style={styles.communityTabsContent}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.skeleton, styles.communityTabSkeleton]} />
        ))}
      </View>
    </View>

    {/* Post Input Skeleton */}
    <View style={styles.postCreationContainer}>
      <View style={[styles.skeleton, {height: 80, marginBottom: 12}]} />
      <View style={[styles.skeleton, {width: 80, height: 40, alignSelf: 'flex-end'}]} />
    </View>

    {/* Posts Skeleton */}
    {[1, 2, 3].map((i) => (
      <View key={i} style={styles.postCard}>
        <View style={styles.postHeader}>
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
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const router = useRouter();

  const [creches, setCreches] = useState<Creche[]>([]);
  const [selectedCreche, setSelectedCreche] = useState<Creche | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [newArticle, setNewArticle] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
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

  // Load articles for selected creche
  const loadCrecheArticles = useCallback(async (creche: Creche | null) => {
    if (!creche) return;

    try {
      let query = supabase
        .from('articles')
        .select(`
          *,
          creches(name, logo, suburb, province),
          article_likes(*),
          article_comments(*, profiles(first_name, last_name, avatar_url))
        `)
        .eq('creche_id', creche.id);

      // Apply filters
      if (postFilter === 'popular') {
        query = query.order('hearts', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
      setArticles([]);
    }
  }, [postFilter]);

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

  useEffect(() => {
    if (selectedCreche) {
      loadCrecheArticles(selectedCreche);
    } else {
      setArticles([]);
    }
  }, [selectedCreche, loadCrecheArticles]);

  // Handlers
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.id) {
      await loadFavoriteCreches(user.id);
    }
    await loadCrecheArticles(selectedCreche);
    
    // Refresh follower counts
    const allCrecheIds = [...creches.map(c => c.id), ...allCreches.map(c => c.id)];
    await loadFollowerCounts(allCrecheIds);
    
    setRefreshing(false);
  }, [user?.id, selectedCreche, loadFavoriteCreches, loadCrecheArticles, loadFollowerCounts, creches, allCreches]);

  const createArticle = useCallback(async () => {
    if (!newArticle.trim() || !selectedCreche || !user?.id) return;
    
    try {
      const { error } = await supabase
        .from('articles')
        .insert([{
          title: newArticle.substring(0, 100), // First 100 chars as title
          content: newArticle.trim(),
          type: 'update',
          creche_id: selectedCreche.id,
          author_id: user.id,
          latitude: 0, // You might want to get actual location
          longitude: 0,
        }]);

      if (error) throw error;

      setNewArticle('');
      await loadCrecheArticles(selectedCreche);
    } catch (error) {
      console.error('Error creating article:', error);
      Alert.alert('Error', 'Failed to create post');
    }
  }, [newArticle, selectedCreche, user?.id, loadCrecheArticles]);

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

  const toggleLike = useCallback(async (articleId: string) => {
    if (!user?.id) return;
    
    try {
      const article = articles.find(a => a.id === articleId);
      if (!article) return;

      const existingLike = article.article_likes.find(like => like.user_id === user.id);

      if (existingLike) {
        // Unlike
        await supabase
          .from('article_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);

        // Update hearts count
        await supabase
          .from('articles')
          .update({ hearts: Math.max(0, article.hearts - 1) })
          .eq('id', articleId);
      } else {
        // Like
        await supabase
          .from('article_likes')
          .insert([{
            user_id: user.id,
            article_id: articleId,
          }]);

        // Update hearts count
        await supabase
          .from('articles')
          .update({ hearts: (article.hearts || 0) + 1 })
          .eq('id', articleId);
      }

      // Reload articles to show updated likes
      await loadCrecheArticles(selectedCreche);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }, [user?.id, articles, selectedCreche, loadCrecheArticles]);

  const shareArticle = async (article: Article) => {
    try {
      setSharingArticle(true);
      
      const crecheName = article.creches.name;
      const shareUrl = `https://crechespots.co.za/article/${article.id}`;
      
      const message = `Check out this update from ${crecheName} on CrecheSpots: ${shareUrl}`;

      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(message);
        Alert.alert('Copied to clipboard', 'Article link has been copied to your clipboard');
      } else {
        await RNShare.share({
          message: message,
          title: `Update from ${crecheName}`,
        });
      }
    } catch (error) {
      console.error('Error sharing article:', error);
    } finally {
      setSharingArticle(false);
    }
  };

  // Derived data
  const filteredCreches = useMemo(() => {
    if (!searchQuery.trim()) return allCreches;
    const q = searchQuery.toLowerCase();
    return allCreches.filter(c => c.name.toLowerCase().includes(q));
  }, [allCreches, searchQuery]);

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
    return creche.suburb || creche.province || 'Location not specified';
  };

  const getCategoryColor = (type: string) => {
    const colors: Record<string, string> = {
      'helpful': '#84a7f6',
      'events': '#9cdcb8',
      'donation': '#f68484',
      'news': '#f68484',
      'tips': '#84a7f6',
      'activities': '#f6cc84',
      'announcements': '#2563eb',
      'safety': '#f684a3',
      'update': '#9cdcb8',
    };
    return colors[type?.toLowerCase()] || '#2563eb';
  };

  // Renderers
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

  const renderArticle = ({ item: article }: { item: Article }) => {
    const likeCount = article.hearts || 0;
    const hasUserLiked = article.article_likes.some(like => like.user_id === userId);
    const latestComment = article.article_comments[article.article_comments.length - 1];

    return (
      <Pressable
        style={styles.articleCard}
        onPress={() => router.push(`/article/${article.id}`)}
      >
        <View style={styles.articleHeader}>
          <View style={styles.crecheInfoContainer}>
            <Image 
              source={{ uri: article.creches.logo || 'https://crechespots.co.za/brand.png' }} 
              style={styles.crecheAvatar} 
            />
            <View>
              <Text style={styles.crecheName}>{article.creches.name}</Text>
              <View style={styles.locationRow}>
                <MapPin size={12} color="#9ca3af" />
                <Text style={styles.location}>
                  {getLocationText(article.creches)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.articleTime}>{formatTimeAgo(article.created_at)}</Text>
        </View>

        {article.type && (
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(article.type) }]}>
            <Text style={styles.categoryText}>{article.type.toUpperCase()}</Text>
          </View>
        )}

        <Text style={styles.articleTitle}>{article.title}</Text>
        <Text style={styles.articleContent} numberOfLines={3}>
          {article.content}
        </Text>

        <View style={styles.engagementRow}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => toggleLike(article.id)}
          >
            <Heart 
              size={18} 
              color={hasUserLiked ? '#ef4444' : '#6b7280'} 
              fill={hasUserLiked ? '#ef4444' : 'none'} 
            />
            <Text style={[styles.actionCount, hasUserLiked && { color: '#ef4444' }]}>
              {likeCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push(`/article/${article.id}`)}
          >
            <MessageCircle size={18} color="#6b7280" />
            <Text style={styles.actionCount}>{article.article_comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => shareArticle(article)}
            disabled={sharingArticle}
          >
            <Share size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {latestComment && (
          <View style={styles.latestComment}>
            <Text style={styles.commentAuthor}>{latestComment.profiles.first_name}: </Text>
            <Text style={styles.commentText} numberOfLines={1}>
              {latestComment.content}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  // Main render
  if (!initialLoadComplete || loading) {
    return <SkeletonLoader />;
  }

  if (showAddCreche) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowAddCreche(false)} style={styles.backButton}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Creche</Text>
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

      {/* Creche Tabs */}
      <View style={styles.tabsWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={creches}
          keyExtractor={(item) => item.id}
          renderItem={renderCrecheTab}
          contentContainerStyle={styles.crecheTabsContent}
        />
      </View>

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

      {/* Articles List */}
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={renderArticle}
        ListHeaderComponent={
          selectedCreche ? (
            <View style={styles.postCreationContainer}>
              <TextInput
                style={styles.postInput}
                placeholder="Share an update with parents..."
                placeholderTextColor="#9ca3af"
                value={newArticle}
                onChangeText={setNewArticle}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.postButton, !newArticle.trim() && styles.postButtonDisabled]}
                onPress={createArticle}
                disabled={!newArticle.trim()}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyPosts}>
            <BookOpen size={64} color="#d1d5db" />
            <Text style={styles.emptyPostsText}>No Posts Yet</Text>
            <Text style={styles.emptyPostsSubtext}>Be the first to share an update from this creche</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 24 }}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    backgroundColor: '#f3f4f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
    backgroundColor: '#f3f4f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Post Creation
  postCreationContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  postInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    color: '#374151',
  },
  postButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  postButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  postButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  // Article Card
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
  crecheInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  crecheAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  crecheName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  articleTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  actionCount: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  latestComment: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  commentText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
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
  emptyPosts: {
    padding: 40,
    alignItems: 'center',
  },
  emptyPostsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyPostsSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Skeleton styles
  skeleton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  communityTabSkeleton: {
    minHeight: 36,
    width: 100,
    marginHorizontal: 4,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});