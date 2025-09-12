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
import { Search, MapPin, Star, Filter, SlidersHorizontal } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [creches, setCreches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter(); // Add router hook

  useEffect(() => {
    fetchCreches();
  }, []);

  const fetchCreches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('creches')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setCreches(data || []);
    } catch (err) {
      console.error('Error fetching creches:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCrechePress = (crecheId: string) => {
    // Navigate to the detail page with the creche ID
    router.push(`/search/${crecheId}`);
  };

  const renderSearchResult = (result: any) => (
    <Pressable 
      key={result.id} 
      style={styles.resultCard}
      onPress={() => handleCrechePress(result.id)} // Add onPress handler
    >
      <Image 
        source={{ uri: result.header_image || 'https://crechespots.co.za/wp-content/uploads/2025/09/cropped-cropped-brand.png' }} 
        style={styles.resultImage} 
        defaultSource={{ uri: 'https://crechespots.co.za/wp-content/uploads/2025/09/cropped-cropped-brand.png' }}
      />
      
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
              {result.suburb || result.province || 'South Africa'} • {result.distance || 'Nearby'}
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
          <Text style={styles.price}>
            {result.monthly_price ? `R${result.monthly_price}/month` : 
             result.weekly_price ? `R${result.weekly_price}/week` : 
             result.price ? `R${result.price}/day` : 'Contact for pricing'}
          </Text>
          <Text style={[styles.availability, { color: '#22c55e' }]}>
            Available
          </Text>
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#bd4ab5" />
        <Text style={styles.loadingText}>Loading creches...</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Childcare</Text>
        <Text style={styles.headerSubtitle}>Discover trusted creches near you</Text>
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
        </View>
        
        <Pressable style={styles.filterButton}>
          <SlidersHorizontal size={20} color="#bd4ab5" />
        </Pressable>
      </View>

      {/* Quick Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContentContainer}
        >
          <Pressable style={[styles.filterChip, styles.activeFilter]}>
            <Text style={[styles.filterText, styles.activeFilterText]}>All</Text>
          </Pressable>
          <Pressable style={styles.filterChip}>
            <Text style={styles.filterText}>Nearby</Text>
          </Pressable>
          <Pressable style={styles.filterChip}>
            <Text style={styles.filterText}>Verified</Text>
          </Pressable>
          <Pressable style={styles.filterChip}>
            <Text style={styles.filterText}>Available</Text>
          </Pressable>
          <Pressable style={styles.filterChip}>
            <Text style={styles.filterText}>Budget</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Results */}
      <ScrollView style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>{creches.length} creches found</Text>
          <Pressable style={styles.sortButton}>
            <Text style={styles.sortText}>Sort by Distance</Text>
            <Filter size={16} color="#bd4ab5" />
          </Pressable>
        </View>
        
        <View style={styles.results}>
          {creches.length > 0 ? (
            creches.map(renderSearchResult)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No creches found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search criteria or check back later.
              </Text>
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
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bd4ab5',
  },
  filtersWrapper: {
    backgroundColor: '#ffffff',
    height: 56,
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
    backgroundColor: '#bd4ab5',
    borderColor: '#bd4ab5',
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
    color: '#bd4ab5',
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
  resultImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e5e7eb',
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
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bd4ab5',
  },
  availability: {
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
    backgroundColor: '#bd4ab5',
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
  },
});