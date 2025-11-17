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
import { Search, X, ChevronRight, Navigation, MapPin } from 'lucide-react-native';
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
      style={styles.locationItem}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationIcon}>
        <MapPin size={16} color="#bd84f6" />
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName} numberOfLines={1}>
          {getLocationDisplayName(item)}
        </Text>
        <Text style={styles.locationAddress} numberOfLines={2}>
          {item.display_name}
        </Text>
      </View>
      <ChevronRight size={20} color="#9ca3af" />
    </Pressable>
  );

  const data = searchQuery.trim() ? searchResults : [
    {
      id: 'current',
      name: 'Use Current Location',
      suburb: 'Current Location',
      city: 'Detected Automatically',
      province: '',
      latitude: 0,
      longitude: 0,
      display_name: 'Use your current location',
    },
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
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Location</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#374151" />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for suburb, city or province..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={false}
          />
          {isSearching && (
            <ActivityIndicator size="small" color="#bd84f6" />
          )}
        </View>

        <FlatList
          data={data}
          keyExtractor={(item, index) => item.id || `location-${index}`}
          renderItem={({ item }) => (
            item.id === 'current' ? (
              <Pressable 
                style={styles.locationItem}
                onPress={onUseCurrentLocation}
              >
                <View style={styles.locationIcon}>
                  <Navigation size={16} color="#bd84f6" />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{item.name}</Text>
                  <Text style={styles.locationAddress}>{item.display_name}</Text>
                </View>
                <ChevronRight size={20} color="#bd84f6" />
              </Pressable>
            ) : (
              renderLocationItem({ item })
            )
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            !isSearching && searchQuery.trim() ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No locations found for "{searchQuery}"
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Try searching for a different area
                </Text>
              </View>
            ) : null
          }
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 60,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default LocationModal;