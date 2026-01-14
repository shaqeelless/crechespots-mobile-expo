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
} from 'react-native';
import { Search, X, ChevronRight, Navigation, MapPin, Star } from 'lucide-react-native';
import { searchLocations, getPopularLocations } from '@/utils/locationService';

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
  const [popularLocations, setPopularLocations] = useState<Location[]>([]);

  useEffect(() => {
    setPopularLocations(getPopularLocations());
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

const handleLocationSelect = (location: Location) => {
  console.log('📍 Modal: Location selected', {
    id: location.id,
    suburb: location.suburb,
    city: location.city,
    province: location.province,
    name: location.name
  });
  
  onLocationSelect(location);
  onClose();
};

  const getLocationDisplayName = (location: Location) => {
    if (location.suburb && location.city && location.suburb !== location.city) {
      return `${location.suburb}, ${location.city}`;
    } else if (location.city) {
      return location.city;
    } else if (location.name) {
      return location.name;
    }
    return location.display_name?.split(',')[0] || 'Unknown Location';
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
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
          {getLocationDisplayName(item)}
        </Text>
        <Text style={styles.locationAddress} numberOfLines={2}>
          {item.display_name}
        </Text>
      </View>
      <ChevronRight size={20} color="#cbd5e1" />
    </Pressable>
  );

  const renderCurrentLocationItem = () => (
    <Pressable 
      style={({ pressed }) => [
        styles.locationItem,
        styles.currentLocationItem,
        pressed && styles.locationItemPressed,
      ]}
      onPress={onUseCurrentLocation}
    >
      <View style={styles.locationIconContainer}>
        <View style={[styles.locationIcon, styles.currentLocationIcon]}>
          <Navigation size={20} color="#ffffff" />
        </View>
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.currentLocationName}>Current Location</Text>
        <Text style={styles.currentLocationAddress}>
          {currentLocation?.display_name || 'Detect automatically using GPS'}
        </Text>
      </View>
      <ChevronRight size={20} color="#8b5cf6" />
    </Pressable>
  );

  const renderPopularLocationItem = ({ item, index }: { item: Location; index: number }) => (
    <Pressable 
      style={({ pressed }) => [
        styles.locationItem,
        pressed && styles.locationItemPressed,
      ]}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationIconContainer}>
        <View style={styles.popularLocationIcon}>
          <View style={styles.popularBadge}>
            <Star size={12} color="#ffffff" />
          </View>
          <MapPin size={20} color="#8b5cf6" />
        </View>
      </View>
      <View style={styles.locationInfo}>
        <View style={styles.popularHeader}>
          <Text style={styles.locationName} numberOfLines={1}>
            {getLocationDisplayName(item)}
          </Text>
          <Text style={styles.popularTag}>Popular</Text>
        </View>
        <Text style={styles.locationAddress} numberOfLines={2}>
          {item.display_name}
        </Text>
      </View>
      <ChevronRight size={20} color="#cbd5e1" />
    </Pressable>
  );

  const data = searchQuery.trim() ? searchResults : [
    ...popularLocations,
  ];

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
            <Text style={styles.modalTitle}>Select Location</Text>
            <Text style={styles.modalSubtitle}>
              Choose your current city or province
            </Text>
          </View>
          <Pressable 
            onPress={onClose} 
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
              placeholder="Search cities, suburbs or provinces..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={false}
            />
            {isSearching ? (
              <ActivityIndicator size="small" color="#8b5cf6" />
            ) : searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={18} color="#94a3b8" />
              </Pressable>
            ) : null}
          </View>
        </View>

        <FlatList
          data={data}
          keyExtractor={(item, index) => item.id || `location-${index}`}
          renderItem={({ item, index }) => {
            if (!searchQuery.trim() && popularLocations.length > 0 && index === 0) {
              return (
                <>
                  {renderCurrentLocationItem()}
                  <View style={styles.sectionHeader}>
                    <Star size={16} color="#8b5cf6" />
                    <Text style={styles.sectionTitle}>Popular Locations</Text>
                  </View>
                  {renderPopularLocationItem({ item, index })}
                </>
              );
            }
            return renderLocationItem({ item });
          }}
          ListHeaderComponent={() => {
            if (searchQuery.trim() || !popularLocations.length) return null;
            return (
              <>
                {renderCurrentLocationItem()}
                <View style={styles.sectionHeader}>
                  <Star size={16} color="#8b5cf6" />
                  <Text style={styles.sectionTitle}>Popular Locations</Text>
                </View>
              </>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            !isSearching && searchQuery.trim() ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIllustration}>
                  <MapPin size={48} color="#cbd5e1" />
                </View>
                <Text style={styles.emptyStateTitle}>
                  No locations found
                </Text>
                <Text style={styles.emptyStateText}>
                  No results for "{searchQuery}"
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Try searching for a different city or province
                </Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  closeButtonPressed: {
    backgroundColor: '#f1f5f9',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
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
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 24,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  locationItemPressed: {
    backgroundColor: '#f8fafc',
  },
  currentLocationItem: {
    backgroundColor: '#faf5ff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  locationIconContainer: {
    width: 48,
    alignItems: 'center',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationIcon: {
    backgroundColor: '#8b5cf6',
  },
  popularLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  currentLocationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  currentLocationAddress: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  popularHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  popularTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d97706',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 84,
    marginRight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyIllustration: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    borderStyle: 'dashed',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default LocationModal;