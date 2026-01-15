import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import SideMenu from '@/components/SideMenu';
import { 
  getCurrentLocation, 
  getCrechesWithinRadius,
  calculateDistance 
} from '@/utils/locationService';

// Import components
import HomeHeader from '@/components/home/HomeHeader';
import SkeletonLoader from '@/components/home/SkeletonLoader';
import QuickActions from '@/components/home/QuickActions';
import NearbyCreches from '@/components/home/NearbyCreches';
import ApplicationStatus from '@/components/home/ApplicationStatus';
import BottomSpaces from '@/components/home/BottomSpaces';
import LocationModal from '@/components/home/LocationModal';

const { width, height } = Dimensions.get('window');

interface Creche {
  id: string;
  name: string;
  header_image: string;
  suburb: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  monthly_price: number;
  weekly_price: number;
  price: number;
  capacity: number;
  registered: boolean;
  applications: boolean;
  distance?: number;
}

export default function HomeScreen() {
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [creches, setCreches] = useState<Creche[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const { profile, updateProfile } = useAuth();
  const router = useRouter();

  // Animation values
  const headerScale = useSharedValue(0.8);
  const headerOpacity = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  // Current location state
  const [currentLocation, setCurrentLocation] = useState({
    suburb: profile?.suburb || '',
    city: profile?.city || '',
    province: profile?.province || '',
    latitude: profile?.latitude || null,
    longitude: profile?.longitude || null,
    display_name: '',
  });

  const getCurrentLocationData = async () => {
    try {
      setLocationLoading(true);
      const locationData = await getCurrentLocation();
      
      if (locationData) {
        const newLocation = {
          suburb: locationData.suburb,
          city: locationData.city,
          province: locationData.province,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          display_name: locationData.display_name,
        };

        setCurrentLocation(newLocation);

        // Update profile with location data including coordinates
        if (profile?.id) {
          await updateProfile({
            suburb: locationData.suburb,
            city: locationData.city,
            province: locationData.province,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          });
        }
      }
      
      setLocationLoading(false);
      return locationData;
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationLoading(false);
      return null;
    }
  };

  useEffect(() => {
    initializeApp();
    
    headerScale.value = withSpring(1, {
      damping: 15,
      stiffness: 120,
    });
    headerOpacity.value = withTiming(1, { duration: 800 });
  }, []);

// In HomeScreen.tsx, update the initializeApp function:

const initializeApp = async () => {
  setLoading(true);
  
  try {
    // First, check if we have cached location data
    let locationData = null;
    
    if (profile?.latitude && profile?.longitude) {
      console.log('📍 Using cached profile location');
      locationData = {
        suburb: profile.suburb || '',
        city: profile.city || '',
        province: profile.province || '',
        latitude: profile.latitude,
        longitude: profile.longitude,
        display_name: '',
      };
      setCurrentLocation(locationData);
    }
    
    // Try to get current location in background
    getCurrentLocationData().then(async (currentLocation) => {
      if (currentLocation) {
        console.log('📍 Got current location from GPS');
        setCurrentLocation(currentLocation);
      }
      
      // Always fetch creches after trying GPS
      await fetchNearbyCreches();
    }).catch(() => {
      // If GPS fails, still fetch with existing location
      fetchNearbyCreches();
    });
    
  } catch (error) {
    console.error('❌ Initialization error:', error);
    setLoading(false);
  }
};

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: headerScale.value }],
      opacity: headerOpacity.value,
    };
  });

  const handleScroll = (event) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  const handleContentSizeChange = (width, height) => {
    contentHeight.value = height;
  };

  // MAIN FUNCTION: Fetch creches using coordinates
const fetchNearbyCreches = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('📍 === FETCHING CRECHES ===');
    console.log('Current location:', {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      suburb: currentLocation.suburb,
      city: currentLocation.city,
      display_name: currentLocation.display_name
    });
    
    // STRATEGY 1: Use coordinates for distance calculation
    if (currentLocation.latitude && currentLocation.longitude) {
      console.log('📍 Strategy 1: Using coordinates for enhanced search');
      
      // Fetch ALL creches first (no radius filter initially)
      const { data, error } = await supabase
        .from('creches')
        .select('*')
        .order('name')
        .limit(50); // Increase limit to get more results
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Calculate distances for all creches
        const crechesWithDistance = data.map(creche => {
          if (creche.latitude && creche.longitude) {
            const distance = calculateDistance(
              currentLocation.latitude,
              currentLocation.longitude,
              creche.latitude,
              creche.longitude
            );
            return { ...creche, distance: Math.round(distance * 10) / 10 };
          }
          return creche;
        });
        
        // Sort by distance (closest first)
        crechesWithDistance.sort((a, b) => {
          if (a.distance === undefined && b.distance === undefined) return 0;
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });
        
        // Take top 20 closest creches
        const topCreches = crechesWithDistance.slice(0, 20);
        
        console.log(`✅ Found ${data.length} creches total, showing ${topCreches.length} closest`);
        console.log('Distances:', topCreches.map(c => ({ 
          name: c.name, 
          distance: c.distance,
          hasCoords: !!(c.latitude && c.longitude)
        })));
        
        setCreches(topCreches);
        setLoading(false);
        setRefreshing(false);
        return;
      }
    }
    
    // STRATEGY 2: Text-based filtering (fallback)
    console.log('📍 Strategy 2: Text-based filtering');
    
    let query = supabase.from('creches').select('*');
    let filterApplied = false;
    let filterType = '';
    
    // Try different location fields in order of specificity
    if (currentLocation.suburb && currentLocation.suburb.trim() !== '') {
      console.log(`🔍 Filtering by suburb: "${currentLocation.suburb}"`);
      query = query.ilike('suburb', `%${currentLocation.suburb}%`);
      filterApplied = true;
      filterType = 'suburb';
    } 
    
    if (!filterApplied && currentLocation.city && currentLocation.city.trim() !== '') {
      console.log(`🔍 Filtering by city: "${currentLocation.city}"`);
      query = query.ilike('city', `%${currentLocation.city}%`);
      filterApplied = true;
      filterType = 'city';
    } 
    
    if (!filterApplied && currentLocation.province && currentLocation.province.trim() !== '') {
      console.log(`🔍 Filtering by province: "${currentLocation.province}"`);
      query = query.ilike('province', `%${currentLocation.province}%`);
      filterApplied = true;
      filterType = 'province';
    }
    
    // If no location filter, show ALL creches from database (no filtering)
    if (!filterApplied) {
      console.log('⚠️ No location filter, showing all creches');
      const { data, error } = await supabase
        .from('creches')
        .select('*')
        .order('name')
        .limit(20);
        
      if (error) throw error;
      
      console.log(`✅ Showing ${data?.length || 0} creches (all available)`);
      setCreches(data || []);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    
    // Execute the filtered query
    const { data, error } = await query
      .order('name')
      .limit(20);

    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} creches with ${filterType} filter`);
    
    // Calculate distances if we have user coordinates
    let crechesWithDistance = data || [];
    if (currentLocation.latitude && currentLocation.longitude) {
      crechesWithDistance = crechesWithDistance.map(creche => {
        if (creche.latitude && creche.longitude) {
          const distance = calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            creche.latitude,
            creche.longitude
          );
          return { ...creche, distance: Math.round(distance * 10) / 10 };
        }
        return creche;
      });
      
      // Sort by distance
      crechesWithDistance.sort((a, b) => {
        if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }
    
    setCreches(crechesWithDistance);
    
    if (crechesWithDistance.length === 0) {
      const locationName = currentLocation.suburb || currentLocation.city || currentLocation.province || 'selected location';
      setError(`No creches found in ${locationName}. Try a different location.`);
    }
    
  } catch (error) {
    console.error('❌ Error fetching creches:', error);
    setError('Failed to load creches. Please pull down to refresh.');
    
    // Try a fallback: get random creches
    try {
      const { data } = await supabase
        .from('creches')
        .select('*')
        .limit(3);
        
      if (data && data.length > 0) {
        console.log('🔄 Fallback: Showing random creches');
        setCreches(data);
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const onRefresh = () => {
    setRefreshing(true);
    fetchNearbyCreches();
  };

  const handleLocationSelect = async (location: any) => {
    try {
      console.log('📍 Selected location:', {
        name: location.name,
        suburb: location.suburb,
        city: location.city,
        province: location.province,
        latitude: location.latitude,
        longitude: location.longitude,
        display_name: location.display_name
      });
      
      // Ensure we have valid coordinates
      if (!location.latitude || !location.longitude) {
        Alert.alert('Location Error', 'Selected location has no coordinates. Please try a different location.');
        return;
      }
      
      const locationData = {
        suburb: location.suburb || location.name || '',
        city: location.city || location.name || '',
        province: location.province || '',
        latitude: location.latitude,
        longitude: location.longitude,
        display_name: location.display_name || `${location.suburb || location.name}, ${location.city}`,
      };

      console.log('📌 Setting location data:', locationData);
      setCurrentLocation(locationData);

      // Update profile with coordinates
      if (profile?.id) {
        await updateProfile({
          suburb: locationData.suburb,
          city: locationData.city,
          province: locationData.province,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        });
      }

      // Fetch creches for new location
      fetchNearbyCreches();
    } catch (error) {
      console.error('❌ Error updating location:', error);
      Alert.alert('Error', 'Failed to update location. Please try again.');
    }
  };

  const handleUseCurrentLocation = async () => {
    console.log('📍 Using current location...');
    await getCurrentLocationData();
    fetchNearbyCreches();
  };

  return (
    <>
      <Animated.ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#bd84f6']}
            tintColor={'#bd84f6'}
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={handleContentSizeChange}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <HomeHeader
          headerAnimatedStyle={headerAnimatedStyle}
          onMenuPress={() => setSideMenuVisible(true)}
          profile={profile}
          locationLoading={locationLoading}
          currentLocation={currentLocation}
          onLocationPress={() => setLocationModalVisible(true)}
        />

        {/* Show Skeleton Loader when loading */}
        {loading && !refreshing ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Quick Actions */}
            <QuickActions router={router} />

            {/* Nearby Creches Section */}
            <NearbyCreches
              currentLocation={currentLocation}
              error={error}
              creches={creches}
              router={router}
              onRetry={fetchNearbyCreches}
              onChangeLocation={() => setLocationModalVisible(true)}
            />

            {/* Application Status */}
            <ApplicationStatus />

            {/* Bottom Spaces Section */}
            <BottomSpaces />
          </>
        )}

        {/* Extra Bottom Padding */}
        <View style={styles.extraBottomPadding} />
      </Animated.ScrollView>

      <SideMenu visible={sideMenuVisible} onClose={() => setSideMenuVisible(false)} />

      {/* Location Selection Modal */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onLocationSelect={handleLocationSelect}
        onUseCurrentLocation={handleUseCurrentLocation}
        currentLocation={currentLocation}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fcfe',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  extraBottomPadding: {
    height: 200,
  },
});