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
import { getCurrentLocation } from '@/utils/locationService';

// Import components
import HomeHeader from '@/components/home/HomeHeader';
import SkeletonLoader from '@/components/home/SkeletonLoader';
import QuickActions from '@/components/home/QuickActions';
import NearbyCreches from '@/components/home/NearbyCreches';
import ApplicationStatus from '@/components/home/ApplicationStatus';
import BottomSpaces from '@/components/home/BottomSpaces';
import ScrollDownIndicator from '@/components/home/ScrollDownIndicator';
import LocationModal from '@/components/home/LocationModal';

const { width, height } = Dimensions.get('window');

interface Creche {
  id: string;
  name: string;
  header_image: string;
  suburb: string;
  city: string;
  province: string;
  monthly_price: number;
  weekly_price: number;
  price: number;
  capacity: number;
  registered: boolean;
  applications: boolean;
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
    latitude: null as number | null,
    longitude: null as number | null,
    display_name: '',
  });

  // Get user's current location using Nominatim API
  const getCurrentLocationData = async () => {
    try {
      setLocationLoading(true);
      const locationData = await getCurrentLocation();
      
      if (locationData) {
        setCurrentLocation({
          suburb: locationData.suburb,
          city: locationData.city,
          province: locationData.province,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          display_name: locationData.display_name,
        });

        // Update profile with location data
        if (profile?.id) {
          await updateProfile({
            suburb: locationData.suburb,
            city: locationData.city,
            province: locationData.province,
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
    
    // Header entrance animation
    headerScale.value = withSpring(1, {
      damping: 15,
      stiffness: 120,
    });
    headerOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const initializeApp = async () => {
    // First try to get current location automatically
    const locationData = await getCurrentLocationData();
    
    // If location failed but we have profile location, use that
    if (!locationData && profile?.city) {
      setCurrentLocation({
        suburb: profile.suburb || '',
        city: profile.city || '',
        province: profile.province || '',
        latitude: null,
        longitude: null,
        display_name: '',
      });
    }
    
    // Then fetch creches
    fetchNearbyCreches();
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

const fetchNearbyCreches = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('Current location for filtering:', currentLocation);
    
    let query = supabase.from('creches').select('*');
    
    // Use the correct columns from your database: suburb and province
    if (currentLocation.suburb && currentLocation.suburb !== 'Current Location') {
      query = query.ilike('suburb', `%${currentLocation.suburb}%`);
      console.log('Filtering by suburb:', currentLocation.suburb);
    } else if (currentLocation.province) {
      query = query.ilike('province', `%${currentLocation.province}%`);
      console.log('Filtering by province:', currentLocation.province);
    }
    
    const { data, error } = await query
      .order('name')
      .limit(10);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Fetched creches:', data?.length);
    setCreches(data || []);
    
    // If no creches found, show appropriate message
    if (data?.length === 0) {
      if (currentLocation.suburb || currentLocation.province) {
        setError(`No creches found in ${currentLocation.suburb || currentLocation.province}. Try a different location.`);
      } else {
        setError('No creches found. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error fetching creches:', error);
    setError('Failed to load creches. Please pull down to refresh.');
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
    console.log('Selected location:', location);
    
    // Use suburb as the primary filter since that's what your database has
    const locationData = {
      suburb: location.suburb || location.name || '',
      city: location.city || location.name || '', // Keep city for display purposes
      province: location.province || '',
      latitude: location.latitude || null,
      longitude: location.longitude || null,
      display_name: location.display_name || '',
    };

    console.log('Processed location data:', locationData);

    setCurrentLocation(locationData);

    // Update profile with location data
    if (profile?.id) {
      await updateProfile({
        suburb: locationData.suburb,
        city: locationData.city,
        province: locationData.province,
      });
    }

    // Refresh creches for new location
    fetchNearbyCreches();
  } catch (error) {
    console.error('Error updating location:', error);
    Alert.alert('Error', 'Failed to update location. Please try again.');
  }
};

  const handleUseCurrentLocation = async () => {
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

        {/* Extra Bottom Padding for better scroll feel */}
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