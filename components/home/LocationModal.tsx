import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Search, X, ChevronRight, MapPin, Navigation } from 'lucide-react-native';
import { searchLocations } from '@/utils/locationService';

interface Location {
  id?: string;
  name?: string;
  suburb: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  display_name: string;
}

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  onUseCurrentLocation: () => void;
  currentLocation: any;
}

const SkeletonLocationItem = () => (
  <View style={styles.skeletonItem}>
    <View style={styles.skeletonIconContainer}>
      <View style={[styles.locationIcon, styles.skeletonIcon]} />
    </View>
    <View style={styles.skeletonInfo}>
      <View style={[styles.skeletonText, { width: '70%', height: 16, marginBottom: 8 }]} />
      <View style={[styles.skeletonText, { width: '50%', height: 14 }]} />
    </View>
  </View>
);

const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  onClose,
  onLocationSelect,
  onUseCurrentLocation,
  currentLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setSearchResults([]);
      setShowSkeleton(false);
      setIsSearching(false);
    }
  }, [visible]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (searchQuery.trim()) {
      // Show skeleton after a short delay
      const skeletonTimeout = setTimeout(() => {
        setShowSkeleton(true);
      }, 300);

      timeoutId = setTimeout(async () => {
        setIsSearching(true);
        
        try {
          console.log('🔍 Searching for:', searchQuery);
          const results = await searchLocations(searchQuery);
          console.log(`📍 Found ${results.length} results for "${searchQuery}"`);
          
          setSearchResults(results);
          setShowSkeleton(false);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
          setShowSkeleton(false);
        } finally {
          setIsSearching(false);
        }
      }, 800);

      return () => {
        clearTimeout(skeletonTimeout);
        clearTimeout(timeoutId);
      };
    } else {
      setSearchResults([]);
      setShowSkeleton(false);
      setIsSearching(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const handleLocationSelect = (location: Location) => {
    console.log('📍 Modal: Location selected', {
      name: getLocationDisplayName(location),
      suburb: location.suburb,
      city: location.city,
      province: location.province,
      coords: `${location.latitude}, ${location.longitude}`
    });
    
    onLocationSelect(location);
    onClose();
    Keyboard.dismiss();
  };

  const getLocationDisplayName = (location: Location) => {
    const parts = location.display_name?.split(',') || [];
    
    if (parts[0]?.trim()) {
      return parts[0].trim();
    }
    
    if (location.suburb && location.city && location.suburb !== location.city) {
      return `${location.suburb}, ${location.city}`;
    } else if (location.city) {
      return location.city;
    } else if (location.name) {
      return location.name;
    }
    
    return 'Location';
  };

  const getLocationDetails = (location: Location) => {
    const parts = location.display_name?.split(',') || [];
    
    if (parts.length > 1) {
      return parts.slice(1).join(', ').trim();
    }
    
    if (location.province) {
      return location.province;
    }
    
    return 'South Africa';
  };

  const renderLocationItem = ({ item }: { item: Location }) => {
    const displayName = getLocationDisplayName(item);
    const details = getLocationDetails(item);
    
    return (
      <Pressable 
        style={({ pressed }) => [
          styles.locationItem,
          pressed && styles.locationItemPressed,
        ]}
        onPress={() => handleLocationSelect(item)}
      >
        <View style={styles.locationIconContainer}>
          <View style={styles.locationIcon}>
            <MapPin size={20} color="#8b5cf6" />
          </View>
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.locationAddress} numberOfLines={1}>
            {details}
          </Text>
        </View>
        <ChevronRight size={20} color="#cbd5e1" />
      </Pressable>
    );
  };

  const renderCurrentLocationItem = () => (
    <Pressable 
      style={({ pressed }) => [
        styles.locationItem,
        pressed && styles.locationItemPressed,
      ]}
      onPress={() => {
        onUseCurrentLocation();
        onClose();
      }}
    >
      <View style={styles.locationIconContainer}>
        <View style={[styles.locationIcon, styles.currentLocationIcon]}>
          <Navigation size={20} color="#ffffff" />
        </View>
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.currentLocationName}>Use Current Location</Text>
        <Text style={styles.currentLocationAddress}>
          Detect automatically using GPS
        </Text>
      </View>
      <ChevronRight size={20} color="#8b5cf6" />
    </Pressable>
  );

  const renderSkeletonLoading = () => {
    return (
      <View style={styles.skeletonContainer}>
        {[1, 2, 3, 4, 5].map((item) => (
          <React.Fragment key={`skeleton-${item}`}>
            <SkeletonLocationItem />
            {item < 5 && <View style={styles.separator} />}
          </React.Fragment>
        ))}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (showSkeleton || isSearching) {
      return renderSkeletonLoading();
    }

    // Don't show any message when no results
    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.modalTitle}>Search Location</Text>
            <Text style={styles.modalSubtitle}>
              Search for cities, suburbs, or townships
            </Text>
          </View>
          <Pressable 
            onPress={() => {
              onClose();
              Keyboard.dismiss();
            }} 
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
          >
            <X size={24} color="#64748b" />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (searchQuery.trim() && searchResults.length > 0) {
                  handleLocationSelect(searchResults[0]);
                }
              }}
            />
            {(isSearching || showSkeleton) ? (
              <ActivityIndicator size="small" color="#8b5cf6" />
            ) : searchQuery ? (
              <Pressable 
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color="#94a3b8" />
              </Pressable>
            ) : null}
          </View>
        </View>

        <FlatList
          data={searchQuery.trim() && !showSkeleton ? searchResults : []}
          keyExtractor={(item, index) => item.id || `location-${index}-${Date.now()}`}
          renderItem={renderLocationItem}
          ListHeaderComponent={() => {
            if (searchQuery.trim()) return null;
            return renderCurrentLocationItem();
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={() => {
            if (searchQuery.trim() && searchResults.length > 0 && !showSkeleton) {
              return (
                <View style={styles.resultsFooter}>
                  <Text style={styles.resultsCount}>
                    {searchResults.length} location{searchResults.length !== 1 ? 's' : ''} found
                  </Text>
                </View>
              );
            }
            return null;
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  closeButtonPressed: {
    backgroundColor: '#f1f5f9',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
    marginHorizontal: 12,
    padding: 0,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  locationItemPressed: {
    backgroundColor: '#f8fafc',
  },
  locationIconContainer: {
    width: 40,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationIcon: {
    backgroundColor: '#8b5cf6',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  currentLocationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#64748b',
  },
  currentLocationAddress: {
    fontSize: 14,
    color: '#94a3b8',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 72,
    marginRight: 20,
  },
  skeletonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  skeletonIconContainer: {
    width: 40,
  },
  skeletonIcon: {
    backgroundColor: '#f1f5f9',
  },
  skeletonInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  skeletonText: {
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  resultsFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 8,
  },
  resultsCount: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default LocationModal;