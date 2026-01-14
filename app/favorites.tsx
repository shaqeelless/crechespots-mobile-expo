import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Heart, Star, MapPin, ArrowLeft, MoreVertical } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

interface FavoriteCreche {
  id: string;
  creche_id: string;
  created_at: string;
  creches: {
    id: string;
    name: string;
    header_image: string;
    suburb: string;
    province: string; // Changed from city to province
    monthly_price: number;
    weekly_price: number;
    price: number;
    capacity: number;
    registered: boolean;
  };
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteCreche[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      
      // First get the favorite IDs
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('user_favorites')
        .select('id, creche_id, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (favoritesError) throw favoritesError;

      if (favoritesData && favoritesData.length > 0) {
        // Then get the creche details for each favorite
        const crecheIds = favoritesData.map(fav => fav.creche_id);
        
        const { data: crechesData, error: crechesError } = await supabase
          .from('creches')
          .select('*')
          .in('id', crecheIds);

        if (crechesError) throw crechesError;

        // Combine the data
        const combinedData = favoritesData.map(fav => ({
          ...fav,
          creches: crechesData?.find(c => c.id === fav.creche_id) || null
        }));

        setFavorites(combinedData);
      } else {
        setFavorites([]);
      }
      
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(f => f.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Helper function to get location text
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

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Favorites</Text>
            <Text style={styles.headerSubtitle}>Your saved childcare options</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.emptyState}>
          <Heart size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Please log in</Text>
          <Text style={styles.emptyDescription}>
            Log in to view your favorite creches
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Favorites</Text>
          <Text style={styles.headerSubtitle}>Your saved childcare options</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

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
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.loadingText}>Loading your favorites...</Text>
          </View>
        ) : favorites.length > 0 ? (
          favorites.map((favorite) => (
            <Pressable
              key={favorite.id}
              style={({ pressed }) => [
                styles.favoriteCard,
                pressed && styles.favoriteCardPressed,
              ]}
              onPress={() => router.push(`/search/${favorite.creche_id}`)}
            >
              <Image
                source={{
                  uri: favorite.creches?.header_image || 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg'
                }}
                style={styles.favoriteImage}
              />

              {favorite.creches?.registered && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}

              <View style={styles.favoriteContent}>
                <View style={styles.favoriteHeader}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.favoriteName}>{favorite.creches?.name}</Text>
                    {favorite.creches?.capacity && (
                      <Text style={styles.capacityBadge}>
                        Capacity: {favorite.creches.capacity}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    style={({ pressed }) => [
                      styles.heartButton,
                      pressed && styles.heartButtonPressed,
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      removeFavorite(favorite.id);
                    }}
                  >
                    <Heart size={20} color="#ef4444" fill="#ef4444" />
                  </Pressable>
                </View>

                <View style={styles.favoriteInfo}>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.rating}>4.8</Text>
                    <Text style={styles.reviews}>(124)</Text>
                  </View>

                  <View style={styles.locationContainer}>
                    <MapPin size={12} color="#9ca3af" />
                    <Text style={styles.location}>
                      {getLocationText(favorite.creches)}
                    </Text>
                  </View>
                </View>

                <View style={styles.favoriteFooter}>
                  <Text style={styles.price}>
                    {favorite.creches?.monthly_price
                      ? `R${favorite.creches.monthly_price}/month`
                      : favorite.creches?.weekly_price
                      ? `R${favorite.creches.weekly_price}/week`
                      : favorite.creches?.price
                      ? `R${favorite.creches.price}/day`
                      : 'Contact for pricing'}
                  </Text>
                  <Text style={styles.savedDate}>
                    Saved {formatTimeAgo(favorite.created_at)}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIllustration}>
              <Heart size={64} color="#d1d5db" />
            </View>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyDescription}>
              Start exploring and save your favorite creches to see them here
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.exploreButton,
                pressed && styles.exploreButtonPressed,
              ]}
              onPress={() => router.push('/search')}
            >
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
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  favoriteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  favoriteCardPressed: {
    backgroundColor: '#fafafa',
    transform: [{ scale: 0.99 }],
  },
  favoriteImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e2e8f0',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#10b981',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  verifiedText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  favoriteContent: {
    padding: 16,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  capacityBadge: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButtonPressed: {
    backgroundColor: '#fee2e2',
  },
  favoriteInfo: {
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  favoriteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  savedDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  exploreButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonPressed: {
    backgroundColor: '#7c3aed',
    transform: [{ scale: 0.98 }],
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});