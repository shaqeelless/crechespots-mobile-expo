import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Search, MapPin, Star, Filter, SlidersHorizontal, X, Heart, Bookmark, ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

// Skeleton Loading Component (unchanged)
const SkeletonLoader = () => {
  return (
    <View style={styles.skeletonContainer}>
      {/* Search Bar Skeleton */}
      <View style={styles.skeletonSearchContainer}>
        <View style={styles.skeletonSearchBar} />
        <View style={styles.skeletonFilterButton} />
      </View>

      {/* Filters Skeleton */}
      <View style={styles.skeletonFilters}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.skeletonFilterChip} />
        ))}
      </View>

      {/* Results Count Skeleton */}
      <View style={styles.skeletonResultsHeader}>
        <View style={styles.skeletonResultsCount} />
        <View style={styles.skeletonSortButton} />
      </View>

      {/* Result Cards Skeleton */}
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={styles.skeletonResultCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonHeader}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonBadge} />
            </View>
            <View style={styles.skeletonRating} />
            <View style={styles.skeletonLocation} />
            <View style={styles.skeletonTags}>
              <View style={styles.skeletonTag} />
              <View style={styles.skeletonTag} />
              <View style={styles.skeletonTag} />
            </View>
            <View style={styles.skeletonFooter}>
              <View style={styles.skeletonPrice} />
              <View style={styles.skeletonButton} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [creches, setCreches] = useState([]);
  const [filteredCreches, setFilteredCreches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoritesLoading, setFavoritesLoading] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchCreches();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    filterCreches();
  }, [searchQuery, creches, activeFilter]);

  const fetchCreches = async () => {
    try {
      setLoading(true);
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data, error } = await supabase
        .from('creches')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setCreches(data || []);
      setFilteredCreches(data || []);
    } catch (err) {
      console.error('Error fetching creches:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('creche_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const favoriteIds = new Set(data?.map(fav => fav.creche_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (crecheId: string) => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    // Optimistic update
    const wasFavorite = favorites.has(crecheId);
    const newFavorites = new Set(favorites);
    
    if (wasFavorite) {
      newFavorites.delete(crecheId);
    } else {
      newFavorites.add(crecheId);
    }
    
    setFavorites(newFavorites);
    setFavoritesLoading(prev => new Set(prev).add(crecheId));

    try {
      if (wasFavorite) {
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
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update on error
      const revertedFavorites = new Set(favorites);
      if (wasFavorite) {
        revertedFavorites.add(crecheId);
      } else {
        revertedFavorites.delete(crecheId);
      }
      setFavorites(revertedFavorites);
    } finally {
      setFavoritesLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(crecheId);
        return newSet;
      });
    }
  };

  const filterCreches = () => {
    let filtered = [...creches];

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(creche =>
        creche.name?.toLowerCase().includes(query) ||
        creche.suburb?.toLowerCase().includes(query) ||
        creche.city?.toLowerCase().includes(query) ||
        creche.province?.toLowerCase().includes(query) ||
        creche.address?.toLowerCase().includes(query) ||
        (creche.services && Object.keys(creche.services).some(service =>
          service.toLowerCase().includes(query)
        ))
      );
    }

    // Apply active filter
    switch (activeFilter) {
      case 'available':
        filtered = filtered.filter(creche => creche.applications === true);
        break;
      case 'budget':
        // Filter for creches with monthly price under R2000
        filtered = filtered.filter(creche => 
          creche.monthly_price && creche.monthly_price <= 2000
        );
        break;
      case 'saved':
        // Filter for saved/favorited creches
        filtered = filtered.filter(creche => favorites.has(creche.id));
        break;
      case 'nearby':
        // For now, just show all since we don't have location data
        // In a real app, you'd filter by distance using geolocation
        break;
      default:
        // 'all' filter - show everything
        break;
    }

    setFilteredCreches(filtered);
  };

  const handleCrechePress = (crecheId: string) => {
    router.push(`/search/${crecheId}`);
  };

  const handleApplyPress = (crecheId: string) => {
    router.push(`/apply/${crecheId}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleGoBack = () => {
    router.back();
  };

  const renderSearchResult = (result: any) => {
    const isFavorite = favorites.has(result.id);
    const isFavoriteLoading = favoritesLoading.has(result.id);

    return (
      <Pressable 
        key={result.id} 
        style={styles.resultCard}
        onPress={() => handleCrechePress(result.id)}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: result.logo || 'https://crechespots.co.za/wp-content/uploads/2025/09/cropped-cropped-brand.png' }} 
            style={styles.resultImage} 
            defaultSource={{ uri: 'https://crechespots.co.za/wp-content/uploads/2025/09/cropped-cropped-brand.png' }}
          />
          
          {/* Favorite/Save Button */}
          <Pressable 
            style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(result.id);
            }}
            disabled={isFavoriteLoading}
          >
            {isFavoriteLoading ? (
              <ActivityIndicator size={16} color="#ffffff" />
            ) : isFavorite ? (
              <Bookmark size={16} color="#ffffff" fill="#ffffff" />
            ) : (
              <Bookmark size={16} color="#ffffff" />
            )}
          </Pressable>

          {/* Saved Badge */}
          {isFavorite && !isFavoriteLoading && (
            <View style={styles.savedBadge}>
              <Text style={styles.savedBadgeText}>SAVED</Text>
            </View>
          )}
        </View>
        
        <View style={styles.resultContent}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultName}>{result.name}</Text>
            {result.registered && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>
          
          <View style={styles.resultInfo}>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.rating}>4.9</Text>
              <Text style={styles.reviews}>(156)</Text>
            </View>
            
            <View style={styles.locationContainer}>
              <MapPin size={12} color="#9ca3af" />
              <Text style={styles.location}>
                {result.suburb || result.city || result.province || 'South Africa'}
              </Text>
            </View>
          </View>
          
          <View style={styles.tagsContainer}>
            {result.services && Object.entries(result.services).slice(0, 3).map(([service, available], index) => (
              available && (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>
                    {service.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Text>
                </View>
              )
            ))}
          </View>
          
          <View style={styles.resultFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {result.monthly_price ? `R${result.monthly_price}/month` : 
                 result.weekly_price ? `R${result.weekly_price}/week` : 
                 result.price ? `R${result.price}/day` : 'Contact for pricing'}
              </Text>
              <Text style={[styles.availability, { color: '#22c55e' }]}>
                {result.accepting_applications ? 'Accepting Applications' : 'Waitlist Only'}
              </Text>
            </View>
            <Pressable 
              style={[styles.applyButton, !result.accepting_applications && styles.disabledButton]}
              onPress={(e) => {
                e.stopPropagation();
                handleApplyPress(result.id);
              }}
              disabled={!result.accepting_applications}
            >
              <Text style={styles.applyButtonText}>
                {result.accepting_applications ? 'Apply Now' : 'Join Waitlist'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Find Childcare</Text>
            <Text style={styles.headerSubtitle}>Discover trusted creches near you</Text>
          </View>
        </View>
        <SkeletonLoader />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Error loading creches</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchCreches}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleGoBack}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Find Childcare</Text>
          <Text style={styles.headerSubtitle}>Discover trusted creches near you</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, name, or amenity"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={clearSearch} style={styles.clearButton}>
              <X size={16} color="#9ca3af" />
            </Pressable>
          )}
        </View>
        
        <Pressable 
          style={[styles.filterButton, showFilters && styles.activeFilterButton]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={20} color={showFilters ? "#ffffff" : "#bd84f6"} />
        </Pressable>
      </View>

      {/* Quick Filters */}
      <View style={[styles.filtersWrapper, showFilters && styles.expandedFilters]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContentContainer}
        >
          <Pressable 
            style={[styles.filterChip, activeFilter === 'all' && styles.activeFilter]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.filterChip, activeFilter === 'saved' && styles.activeFilter]}
            onPress={() => setActiveFilter('saved')}
          >
            <Text style={[styles.filterText, activeFilter === 'saved' && styles.activeFilterText]}>
              Saved
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.filterChip, activeFilter === 'nearby' && styles.activeFilter]}
            onPress={() => setActiveFilter('nearby')}
          >
            <Text style={[styles.filterText, activeFilter === 'nearby' && styles.activeFilterText]}>
              Nearby
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.filterChip, activeFilter === 'available' && styles.activeFilter]}
            onPress={() => setActiveFilter('available')}
          >
            <Text style={[styles.filterText, activeFilter === 'available' && styles.activeFilterText]}>
              Available
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.filterChip, activeFilter === 'budget' && styles.activeFilter]}
            onPress={() => setActiveFilter('budget')}
          >
            <Text style={[styles.filterText, activeFilter === 'budget' && styles.activeFilterText]}>
              Budget
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Results */}
      <ScrollView style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredCreches.length} creches found
            {searchQuery && ` for "${searchQuery}"`}
            {activeFilter !== 'all' && ` (${activeFilter})`}
          </Text>
          <Pressable style={styles.sortButton}>
            <Text style={styles.sortText}>Sort by Distance</Text>
            <Filter size={16} color="#bd84f6" />
          </Pressable>
        </View>
        
        <View style={styles.results}>
          {filteredCreches.length > 0 ? (
            filteredCreches.map(renderSearchResult)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No creches found</Text>
              <Text style={styles.emptyStateSubtext}>
                {activeFilter === 'saved' 
                  ? "You haven't saved any creches yet. Start exploring and save your favorites!"
                  : "Try adjusting your search criteria or check back later."
                }
              </Text>
              <Pressable style={styles.clearFiltersButton} onPress={() => {
                setSearchQuery('');
                setActiveFilter('all');
                setShowFilters(false);
              }}>
                <Text style={styles.clearFiltersText}>Clear all filters</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fcfe',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flex: 1,
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bd84f6',
  },
  activeFilterButton: {
    backgroundColor: '#bd84f6',
  },
  filtersWrapper: {
    backgroundColor: '#ffffff',
    height: 56,
  },
  expandedFilters: {
    height: 72,
  },
  filtersContainer: {
    flexGrow: 0,
    flexShrink: 1,
  },
  filtersContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilter: {
    backgroundColor: '#bd84f6',
    borderColor: '#bd84f6',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: '#bd84f6',
    fontWeight: '500',
  },
  results: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  resultImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e5e7eb',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  favoriteButtonActive: {
    backgroundColor: '#bd84f6',
  },
  savedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#bd84f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  savedBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  resultContent: {
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultInfo: {
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bd84f6',
    marginBottom: 2,
  },
  availability: {
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#bd84f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#bd84f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearFiltersButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#bd84f6',
    borderRadius: 8,
  },
  clearFiltersText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  // Skeleton Loading Styles (unchanged)
  skeletonContainer: {
    flex: 1,
    backgroundColor: '#f4fcfe',
  },
  skeletonSearchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  skeletonSearchBar: {
    flex: 1,
    height: 48,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  skeletonFilterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  skeletonFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  skeletonFilterChip: {
    width: 80,
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
  },
  skeletonResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  skeletonResultsCount: {
    width: 120,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonSortButton: {
    width: 100,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonResultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  skeletonImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e5e7eb',
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonTitle: {
    flex: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginRight: 8,
  },
  skeletonBadge: {
    width: 24,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  skeletonRating: {
    width: 80,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLocation: {
    width: 120,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  skeletonTag: {
    width: 60,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonPrice: {
    width: 100,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonButton: {
    width: 80,
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
});