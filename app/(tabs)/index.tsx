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
} from 'react-native';
import { Menu, Bell, MapPin, Star, Clock, Users } from 'lucide-react-native';
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

const { width } = Dimensions.get('window');

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
const AnimatedActionButton = ({ emoji, text, backgroundColor, delay, onPress }) => {
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
    <AnimatedPressable 
      style={[styles.actionButton, { backgroundColor }, animatedStyle]}
      onPress={onPress}
    >
      <Animated.Text style={styles.actionEmoji}>{emoji}</Animated.Text>
      <Animated.Text style={[styles.actionText, textAnimatedStyle]}>
        {text}
      </Animated.Text>
    </AnimatedPressable>
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

export default function HomeScreen() {
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [creches, setCreches] = useState<Creche[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();
  const router = useRouter();

  // Header animations
  const headerScale = useSharedValue(0.8);
  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    fetchNearbyCreches();
    
    // Header entrance animation
    headerScale.value = withSpring(1, {
      damping: 15,
      stiffness: 120,
    });
    headerOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: headerScale.value }],
      opacity: headerOpacity.value,
    };
  });

  const fetchNearbyCreches = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('creches')
        .select('*')
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
          
          <AnimatedText 
            style={styles.locationText}
            entering={FadeInUp.delay(400).duration(800).springify()}
          >
            📍{' '}
            {profile
              ? [profile.suburb, profile.city, profile.province].filter(Boolean).join(', ') ||
                'Update your location in profile'
              : 'Loading location...'}
          </AnimatedText>
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
                emoji="🔍"
                text="Find Creches"
                backgroundColor="#f68484"
                delay={700}
                onPress={() => router.push('/search')}
              />
              
              <AnimatedActionButton
                emoji="👶"
                text="My Children"
                backgroundColor="#9cdcb8"
                delay={800}
                onPress={() => router.push('/children')}
              />
              
              <AnimatedActionButton
                emoji="📋"
                text="Applications"
                backgroundColor="#84a7f6"
                delay={900}
                onPress={() => router.push('/applications')}
              />
              
              <AnimatedActionButton
                emoji="📰"
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
              <Text style={styles.sectionTitle}>Nearby Creches</Text>
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
                  <Text style={styles.emptyText}>No creches found in your area</Text>
                  <Pressable style={styles.retryButton} onPress={fetchNearbyCreches}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
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
          </>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </AnimatedScrollView>

      <SideMenu visible={sideMenuVisible} onClose={() => setSideMenuVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fcfe',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderEndEndRadius: 150,
    backgroundColor: '#ffffff',
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
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  actionButton: {
    width: (width - 60) / 4,
    height: 96,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
    marginBottom: 12,
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
  bottomPadding: {
    height: 40,
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