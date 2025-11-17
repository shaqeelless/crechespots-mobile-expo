import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  RefreshControl,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { 
  Menu, 
  Bell, 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  ChevronDown,
  Search,
  Baby,
  ClipboardList,
  Newspaper,
  X,
  ChevronRight,
  Navigation
} from 'lucide-react-native';
import * as Location from 'expo-location';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
  LightSpeedInLeft,
  BounceIn,
} from 'react-native-reanimated';
import SideMenu from '@/components/SideMenu';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

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

interface Location {
  id: string;
  name: string;
  suburb: string;
  city: string;
  province: string;
  latitude?: number;
  longitude?: number;
}

// Animated Components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Skeleton Loading Components
const SkeletonLoader = () => {
  return (
    <AnimatedView entering={FadeIn.duration(600)}>
      {/* Header Skeleton */}
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonMenuButton} />
        <View style={styles.skeletonLogo} />
        <View style={styles.skeletonNotificationButton} />
      </View>
      
      <View style={styles.skeletonWelcome}>
        <View style={styles.skeletonWelcomeLine} />
        <View style={styles.skeletonLocationLine} />
      </View>

      {/* Quick Actions Skeleton */}
      <View style={styles.skeletonQuickActions}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.skeletonActionButton}>
            <View style={styles.skeletonEmoji} />
            <View style={styles.skeletonActionText} />
          </View>
        ))}
      </View>

      {/* Nearby Creches Section Skeleton */}
      <View style={styles.skeletonSection}>
        <View style={styles.skeletonSectionTitle} />
        <View style={styles.skeletonSectionSubtitle} />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.skeletonCrechesContainer}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.skeletonCrecheCard}>
                <View style={styles.skeletonCrecheImage} />
                <View style={styles.skeletonCrecheContent}>
                  <View style={styles.skeletonCrecheName} />
                  <View style={styles.skeletonCrecheInfo}>
                    <View style={styles.skeletonRating} />
                    <View style={styles.skeletonLocation} />
                  </View>
                  <View style={styles.skeletonPrice} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Application Status Skeleton */}
      <View style={styles.skeletonSection}>
        <View style={styles.skeletonSectionTitle} />
        {[1, 2].map((item) => (
          <View key={item} style={styles.skeletonActivityItem}>
            <View style={styles.skeletonActivityIcon} />
            <View style={styles.skeletonActivityContent}>
              <View style={styles.skeletonActivityTitle} />
              <View style={styles.skeletonActivityDescription} />
            </View>
          </View>
        ))}
      </View>
    </AnimatedView>
  );
};

// Animated Skeleton Component
const AnimatedSkeleton = () => {
  const translateX = useSharedValue(-width);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(width, { duration: 1000 }),
        withTiming(-width, { duration: 0 })
      ),
      -1
    );
  }, []);

  return (
    <AnimatedView
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
        },
        animatedStyle,
      ]}
    />
  );
};

// Floating Notification Badge
const FloatingNotificationBadge = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    // Pulsing animation for notification badge
    scale.value = withRepeat(
      withSequence(
        withSpring(1, { damping: 2, stiffness: 100 }),
        withSpring(1.2, { damping: 2, stiffness: 100 }),
        withSpring(1, { damping: 2, stiffness: 100 })
      ),
      -1, // Infinite repeat
      true // Reverse
    );
    opacity.value = withTiming(1, { duration: 500 });
  }, []);

  return (
    <Animated.View style={[styles.notificationBadge, animatedStyle]} />
  );
};

// Animated Action Button
const AnimatedActionButton = ({ icon: Icon, text, backgroundColor, delay, onPress }) => {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            translateY.value,
            [50, 0],
            [10, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        translateY.value,
        [50, 0],
        [0, 1],
        Extrapolate.CLAMP
      ),
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withSpring(0, {
        damping: 12,
        stiffness: 100,
        mass: 0.8,
      });
      opacity.value = withTiming(1, { duration: 600 });
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 100,
      });
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.actionButtonContainer}>
      <AnimatedPressable 
        style={[styles.actionButton, { backgroundColor }, animatedStyle]}
        onPress={onPress}
      >
        <Icon size={24} color="#ffffff" />
      </AnimatedPressable>
      <Animated.Text style={[styles.actionButtonText, textAnimatedStyle]}>
        {text}
      </Animated.Text>
    </View>
  );
};

// Animated Creche Card
const AnimatedCrecheCard = ({ creche, index, onPress }) => {
  const translateX = useSharedValue(100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            scale.value,
            [0.9, 1],
            [1, 1.05],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      translateX.value = withSpring(0, {
        damping: 15,
        stiffness: 90,
        mass: 0.8,
      });
      opacity.value = withTiming(1, { duration: 800 });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 90,
      });
    }, 200 + index * 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatedPressable 
      style={[styles.crecheCard, animatedStyle]}
      onPress={onPress}
    >
      <Animated.Image
        source={{
          uri: creche.header_image || 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg',
        }}
        style={[styles.crecheImage, imageAnimatedStyle]}
      />
      
      {creche.registered && (
        <AnimatedView 
          style={styles.verifiedBadge}
          entering={ZoomIn.delay(500 + index * 150).springify()}
        >
          <Text style={styles.verifiedText}>✓</Text>
        </AnimatedView>
      )}
      
      <View style={styles.crecheContent}>
        <AnimatedText 
          style={styles.crecheName}
          entering={FadeInDown.delay(600 + index * 150).springify()}
        >
          {creche.name}
        </AnimatedText>
        
        <View style={styles.crecheInfo}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#fbbf24" fill="#fbbf24" />
            <AnimatedText 
              style={styles.rating}
              entering={FadeIn.delay(700 + index * 150)}
            >
              4.8
            </AnimatedText>
            <AnimatedText 
              style={styles.reviews}
              entering={FadeIn.delay(750 + index * 150)}
            >
              (124)
            </AnimatedText>
          </View>
          
          <View style={styles.locationContainer}>
            <MapPin size={12} color="#9ca3af" />
            <AnimatedText 
              style={styles.location}
              entering={FadeIn.delay(800 + index * 150)}
            >
              {creche.suburb}, {creche.city}
            </AnimatedText>
          </View>
        </View>
        
        <AnimatedText 
          style={styles.price}
          entering={FadeInUp.delay(850 + index * 150).springify()}
        >
          {creche.monthly_price
            ? `R${creche.monthly_price}/month`
            : creche.weekly_price
            ? `R${creche.weekly_price}/week`
            : creche.price
            ? `R${creche.price}/day`
            : 'Contact for pricing'}
        </AnimatedText>
      </View>
    </AnimatedPressable>
  );
};

// Animated Activity Item
const AnimatedActivityItem = ({ icon: Icon, title, description, backgroundColor, delay }) => {
  const translateX = useSharedValue(-50);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      translateX.value = withSpring(0, {
        damping: 12,
        stiffness: 100,
      });
      opacity.value = withTiming(1, { duration: 600 });
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatedView style={[styles.activityItem, animatedStyle]}>
      <View style={[styles.activityIcon, { backgroundColor }]}>
        <Icon size={16} color="#ffffff" />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityDescription}>{description}</Text>
      </View>
    </AnimatedView>
  );
};

// Scroll Down Indicator Component
const ScrollDownIndicator = ({ scrollY, contentHeight }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const shouldShow = scrollY.value < contentHeight - height * 1.5;
    
    return {
      opacity: shouldShow ? 1 : 0,
      transform: [
        { 
          translateY: withSpring(shouldShow ? 0 : 20, {
            damping: 15,
            stiffness: 100,
          })
        }
      ],
    };
  });

  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withRepeat(
            withSequence(
              withTiming(-2, { duration: 800 }),
              withTiming(2, { duration: 800 })
            ),
            -1,
            true
          )
        }
      ]
    };
  });

  return (
    <AnimatedView style={[styles.scrollIndicator, animatedStyle]}>
      <AnimatedText style={styles.scrollIndicatorText}>
        Scroll for more
      </AnimatedText>
      <AnimatedView style={chevronStyle}>
        <ChevronDown size={16} color="#bd84f6" />
      </AnimatedView>
    </AnimatedView>
  );
};

// Location Selection Modal
const LocationModal = ({ visible, onClose, onLocationSelect, currentLocation, onUseCurrentLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedLocations, setSuggestedLocations] = useState<Location[]>([
    {
      id: 'current',
      name: 'Use Current Location',
      suburb: 'Current Location',
      city: 'Detected Automatically',
      province: '',
    },
    {
      id: '2',
      name: 'Johannesburg Central',
      suburb: 'Braamfontein',
      city: 'Johannesburg',
      province: 'Gauteng',
    },
    {
      id: '3',
      name: 'Cape Town City Bowl',
      suburb: 'City Bowl',
      city: 'Cape Town',
      province: 'Western Cape',
    },
    {
      id: '4',
      name: 'Durban Beachfront',
      suburb: 'Beachfront',
      city: 'Durban',
      province: 'KwaZulu-Natal',
    },
    {
      id: '5',
      name: 'Pretoria East',
      suburb: 'Menlo Park',
      city: 'Pretoria',
      province: 'Gauteng',
    },
  ]);

  const filteredLocations = suggestedLocations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.suburb.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = (location: Location) => {
    if (location.id === 'current') {
      onUseCurrentLocation();
    } else {
      onLocationSelect(location);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
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
          />
        </View>

        <FlatList
          data={filteredLocations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable 
              style={styles.locationItem}
              onPress={() => handleLocationSelect(item)}
            >
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{item.name}</Text>
                <Text style={styles.locationAddress}>
                  {[item.suburb, item.city, item.province].filter(Boolean).join(', ')}
                </Text>
              </View>
              {item.id === 'current' ? (
                <Navigation size={20} color="#bd84f6" />
              ) : (
                <ChevronRight size={20} color="#9ca3af" />
              )}
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </Modal>
  );
};

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
  });

  // Get user's current location
  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please enable location permissions in settings to use automatic location detection.',
          [{ text: 'OK' }]
        );
        setLocationLoading(false);
        return null;
      }

      // Get current position
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      let geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const address = geocode[0];
        const locationData = {
          suburb: address.district || address.subregion || '',
          city: address.city || address.region || '',
          province: address.region || '',
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setCurrentLocation(locationData);
        
        // Update profile with location data
        if (profile?.id) {
          await updateProfile({
            suburb: locationData.suburb,
            city: locationData.city,
            province: locationData.province,
          });
        }

        setLocationLoading(false);
        return locationData;
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or select a location manually.',
        [{ text: 'OK' }]
      );
    }
    
    setLocationLoading(false);
    return null;
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
    const locationData = await getCurrentLocation();
    
    // If location failed but we have profile location, use that
    if (!locationData && profile?.city) {
      setCurrentLocation({
        suburb: profile.suburb || '',
        city: profile.city || '',
        province: profile.province || '',
        latitude: null,
        longitude: null,
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
      
      let query = supabase.from('creches').select('*');
      
      // If we have a specific location, filter by it
      if (currentLocation.city) {
        query = query.ilike('city', `%${currentLocation.city}%`);
      } else if (currentLocation.province) {
        query = query.ilike('province', `%${currentLocation.province}%`);
      }
      
      const { data, error } = await query
        .order('name')
        .limit(10);

      if (error) throw error;
      setCreches(data || []);
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

  const handleLocationSelect = async (location: Location) => {
    try {
      setCurrentLocation({
        suburb: location.suburb,
        city: location.city,
        province: location.province,
        latitude: null,
        longitude: null,
      });

      // Update profile in database if user is logged in
      if (profile?.id) {
        await updateProfile({
          suburb: location.suburb,
          city: location.city,
          province: location.province,
        });
      }

      // Refresh creches for new location
      fetchNearbyCreches();
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleUseCurrentLocation = async () => {
    await getCurrentLocation();
    fetchNearbyCreches();
  };

  const getLocationDisplayText = () => {
    if (locationLoading) {
      return 'Detecting location...';
    }
    if (currentLocation.suburb && currentLocation.city) {
      return `${currentLocation.suburb}, ${currentLocation.city}`;
    } else if (currentLocation.city) {
      return currentLocation.city;
    } else if (currentLocation.province) {
      return currentLocation.province;
    }
    return 'Select your location';
  };

  return (
    <>
      <AnimatedScrollView
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
        <AnimatedView style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.headerTop}>
            <AnimatedPressable 
              style={styles.menuButton} 
              onPress={() => setSideMenuVisible(true)}
            >
              <Menu size={24} color="#374151" />
            </AnimatedPressable>
            
            <AnimatedView 
              style={styles.logoContainer}
              entering={ZoomIn.duration(800).springify()}
            >
              <Image 
                source={require('@/assets/images/SplashScreen.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </AnimatedView>
            
            <AnimatedPressable 
              style={styles.notificationButton}
            >
              <Bell size={24} color="#374151" />
              <FloatingNotificationBadge />
            </AnimatedPressable>
          </View>
          
          <AnimatedText 
            style={styles.welcomeText}
            entering={FadeInUp.delay(200).duration(800).springify()}
          >
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}!
          </AnimatedText>
          
          <Pressable 
            style={styles.locationSelector}
            onPress={() => setLocationModalVisible(true)}
            disabled={locationLoading}
          >
            <MapPin size={16} color="#bd84f6" />
            <AnimatedText 
              style={[
                styles.locationText,
                locationLoading && styles.locationTextLoading
              ]}
              entering={FadeInUp.delay(400).duration(800).springify()}
            >
              {getLocationDisplayText()}
            </AnimatedText>
            {!locationLoading && <ChevronDown size={16} color="#bd84f6" />}
            {locationLoading && (
              <View style={styles.loadingSpinner}>
                <Text style={styles.loadingSpinnerText}>⟳</Text>
              </View>
            )}
          </Pressable>
        </AnimatedView>

        {/* Show Skeleton Loader when loading */}
        {loading && !refreshing ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Quick Actions */}
            <AnimatedView 
              style={styles.quickActions}
              entering={FadeInUp.delay(600).duration(800).springify()}
            >
              <AnimatedActionButton
                icon={Search}
                text="Find Creches"
                backgroundColor="#f68484"
                delay={700}
                onPress={() => router.push('/search')}
              />
              
              <AnimatedActionButton
                icon={Baby}
                text="My Children"
                backgroundColor="#9cdcb8"
                delay={800}
                onPress={() => router.push('/children')}
              />
              
              <AnimatedActionButton
                icon={ClipboardList}
                text="Applications"
                backgroundColor="#84a7f6"
                delay={900}
                onPress={() => router.push('/applications')}
              />
              
              <AnimatedActionButton
                icon={Newspaper}
                text="Feeds"
                backgroundColor="#f6cc84"
                delay={1000}
                onPress={() => router.push('/feeds')}
              />
            </AnimatedView>

            {/* Nearby Creches Section */}
            <AnimatedView 
              style={styles.section}
              entering={FadeInUp.delay(1100).duration(800).springify()}
            >
              <Text style={styles.sectionTitle}>
                {currentLocation.city ? `Nearby Creches in ${currentLocation.city}` : 'Nearby Creches'}
              </Text>
              <Text style={styles.sectionSubtitle}>Accepting applications in your area</Text>
              
              {error ? (
                <AnimatedView 
                  style={styles.errorContainer}
                  entering={BounceIn.duration(800)}
                >
                  <Text style={styles.errorText}>{error}</Text>
                  <Pressable style={styles.retryButton} onPress={fetchNearbyCreches}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </Pressable>
                </AnimatedView>
              ) : creches.length > 0 ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.crechesScrollContent}
                >
                  <View style={styles.crechesContainer}>
                    {creches.map((creche, index) => (
                      <AnimatedCrecheCard
                        key={creche.id}
                        creche={creche}
                        index={index}
                        onPress={() => router.push(`/search/${creche.id}`)}
                      />
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <AnimatedView 
                  style={styles.emptyContainer}
                  entering={BounceIn.duration(800)}
                >
                  <Text style={styles.emptyText}>No creches found in {currentLocation.city || 'your area'}</Text>
                  <Text style={styles.emptySubtext}>Try selecting a different location</Text>
                  <Pressable 
                    style={styles.retryButton} 
                    onPress={() => setLocationModalVisible(true)}
                  >
                    <Text style={styles.retryButtonText}>Change Location</Text>
                  </Pressable>
                </AnimatedView>
              )}
            </AnimatedView>

            {/* Application Status */}
            <AnimatedView 
              style={styles.section}
              entering={FadeInUp.delay(1200).duration(800).springify()}
            >
              <Text style={styles.sectionTitle}>Application Status</Text>
              
              <AnimatedActivityItem
                icon={Clock}
                title="Under Review"
                description="2 applications are currently being reviewed by creches"
                backgroundColor="#f59e0b"
                delay={1300}
              />
              
              <AnimatedActivityItem
                icon={Users}
                title="Application Accepted"
                description="Sunshine Daycare accepted your application for Emma"
                backgroundColor="#22c55e"
                delay={1500}
              />
            </AnimatedView>

            {/* Bottom Spaces Section - Creates the extended scroll feeling */}
            <AnimatedView 
              style={styles.bottomSpaces}
              entering={FadeInUp.delay(1600).duration(800).springify()}
            >
              <View style={styles.bottomSpacesContent}>
                <Text style={styles.bottomSpacesTitle}>More Coming Soon</Text>
                <Text style={styles.bottomSpacesDescription}>
                  We're constantly adding new features and content to enhance your experience
                </Text>
                <View style={styles.bottomSpacesGrid}>
                  <View style={styles.spaceItem}>
                    <Text style={styles.spaceEmoji}>🎓</Text>
                    <Text style={styles.spaceText}>Learning Resources</Text>
                  </View>
                  <View style={styles.spaceItem}>
                    <Text style={styles.spaceEmoji}>👥</Text>
                    <Text style={styles.spaceText}>Parent Community</Text>
                  </View>
                  <View style={styles.spaceItem}>
                    <Text style={styles.spaceEmoji}>📊</Text>
                    <Text style={styles.spaceText}>Progress Tracking</Text>
                  </View>
                  <View style={styles.spaceItem}>
                    <Text style={styles.spaceEmoji}>🎉</Text>
                    <Text style={styles.spaceText}>Events & Activities</Text>
                  </View>
                </View>
              </View>
            </AnimatedView>
          </>
        )}

        {/* Extra Bottom Padding for better scroll feel */}
        <View style={styles.extraBottomPadding} />
      </AnimatedScrollView>

      {/* Scroll Down Indicator */}
      <ScrollDownIndicator scrollY={scrollY} contentHeight={contentHeight} />

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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderEndEndRadius: 150,
    backgroundColor: '#bd84f6',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 200,
    height: 60,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 14,
    color: '#bd84f6',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  locationTextLoading: {
    color: '#9ca3af',
  },
  loadingSpinner: {
    marginLeft: 4,
  },
  loadingSpinnerText: {
    fontSize: 14,
    color: '#bd84f6',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  actionButtonContainer: {
    alignItems: 'center',
    width: (width - 60) / 4,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  crechesScrollContent: {
    paddingRight: 20,
  },
  crechesContainer: {
    flexDirection: 'row',
  },
  crecheCard: {
    width: 250,
    marginRight: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  crecheImage: {
    width: '100%',
    height: 140,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#22c55e',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  crecheContent: {
    padding: 12,
  },
  crecheName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  crecheInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontWeight: '600',
    color: '#fbbf24',
  },
  reviews: {
    marginLeft: 4,
    color: '#6b7280',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    marginLeft: 4,
    color: '#6b7280',
    fontSize: 12,
  },
  price: {
    fontWeight: 'bold',
    color: '#bd84f6',
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#bd84f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  activityDescription: {
    color: '#6b7280',
    fontSize: 14,
  },
  extraBottomPadding: {
    height: 200,
  },
  // Bottom Spaces Section
  bottomSpaces: {
    marginTop: 40,
    marginHorizontal: 20,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(189, 132, 246, 0.2)',
    shadowColor: '#bd84f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  bottomSpacesContent: {
    alignItems: 'center',
  },
  bottomSpacesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  bottomSpacesDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  bottomSpacesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  spaceItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(189, 132, 246, 0.1)',
  },
  spaceEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  spaceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  // Scroll Down Indicator
  scrollIndicator: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: '25%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(189, 132, 246, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scrollIndicatorText: {
    fontSize: 12,
    color: '#bd84f6',
    fontWeight: '600',
    marginBottom: 2,
  },
  // Location Modal Styles
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
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 16,
  },
  // Skeleton Loading Styles
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  skeletonMenuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  skeletonLogo: {
    width: 200,
    height: 60,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  skeletonNotificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  skeletonWelcome: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  skeletonWelcomeLine: {
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  skeletonLocationLine: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '40%',
  },
  skeletonQuickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  skeletonActionButton: {
    width: (width - 60) / 4,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonEmoji: {
    width: 28,
    height: 28,
    backgroundColor: '#d1d5db',
    borderRadius: 14,
    marginBottom: 8,
  },
  skeletonActionText: {
    width: 40,
    height: 12,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
  },
  skeletonSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  skeletonSectionTitle: {
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    width: '40%',
  },
  skeletonSectionSubtitle: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 16,
    width: '60%',
  },
  skeletonCrechesContainer: {
    flexDirection: 'row',
  },
  skeletonCrecheCard: {
    width: 250,
    marginRight: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  skeletonCrecheImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#e5e7eb',
  },
  skeletonCrecheContent: {
    padding: 12,
  },
  skeletonCrecheName: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  skeletonCrecheInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  skeletonRating: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '30%',
  },
  skeletonLocation: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '40%',
  },
  skeletonPrice: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '50%',
  },
  skeletonActivityItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  skeletonActivityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  skeletonActivityContent: {
    flex: 1,
  },
  skeletonActivityTitle: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  skeletonActivityDescription: {
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '90%',
  },
});