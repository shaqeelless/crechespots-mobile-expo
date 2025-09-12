import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Menu, Bell, MapPin, Star, Clock, Users, Navigation } from 'lucide-react-native';
import SideMenu from '@/components/SideMenu';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const featuredCreches = [
  {
    id: 1,
    name: 'Little Learners Academy',
    image: 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg',
    rating: 4.9,
    reviews: 127,
    location: 'Downtown',
    price: '€45/day',
    distance: '0.3 km',
    verified: true,
  },
  {
    id: 2,
    name: 'Happy Kids Daycare',
    image: 'https://images.pexels.com/photos/8613074/pexels-photo-8613074.jpeg',
    rating: 4.8,
    reviews: 89,
    location: 'City Center',
    price: '€40/day',
    distance: '0.8 km',
    verified: true,
  },
  {
    id: 3,
    name: 'Bright Beginnings',
    image: 'https://images.pexels.com/photos/8535231/pexels-photo-8535231.jpeg',
    rating: 4.7,
    reviews: 64,
    location: 'Suburbs',
    price: '€35/day',
    distance: '1.2 km',
    verified: true,
  },
];

const availableSpots = [
  {
    id: 1,
    crecheName: 'Little Learners Academy',
    image: 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg',
    spotsAvailable: 3,
    ageGroup: '2-4 years',
    duration: 'Full-time',
    price: '€45/day',
    location: 'Downtown',
    distance: '0.3 km',
  },
  {
    id: 2,
    crecheName: 'Happy Kids Daycare',
    image: 'https://images.pexels.com/photos/8613074/pexels-photo-8613074.jpeg',
    spotsAvailable: 2,
    ageGroup: '1-3 years',
    duration: 'Part-time',
    price: '€40/day',
    location: 'City Center',
    distance: '0.8 km',
  },
  {
    id: 3,
    crecheName: 'Bright Beginnings',
    image: 'https://images.pexels.com/photos/8535231/pexels-photo-8535231.jpeg',
    spotsAvailable: 5,
    ageGroup: '3-5 years',
    duration: 'Full-time',
    price: '€35/day',
    location: 'Suburbs',
    distance: '1.2 km',
  },
  {
    id: 4,
    crecheName: 'Sunshine Preschool',
    image: 'https://images.pexels.com/photos/8613293/pexels-photo-8613293.jpeg',
    spotsAvailable: 1,
    ageGroup: '4-6 years',
    duration: 'After-school',
    price: '€30/day',
    location: 'Westside',
    distance: '1.5 km',
  },
];

export default function HomeScreen() {
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('📍 Getting location...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      setLoading(true);
      
      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setAddress('📍 Enable location access');
        return;
      }

      // Get current position
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const locationData = reverseGeocode[0];
        const street = locationData.street || '';
        const city = locationData.city || locationData.subregion || '';
        const country = locationData.country || '';
        
        let displayAddress = '';
        if (street && city) {
          displayAddress = `${street}, ${city}`;
        } else if (city) {
          displayAddress = city;
        } else if (country) {
          displayAddress = country;
        } else {
          displayAddress = 'Current location';
        }
        
        setAddress(`📍 ${displayAddress}`);
      } else {
        setAddress('📍 Current location');
      }

    } catch (err) {
      console.error('Error getting location:', err);
      setError('Failed to get location');
      setAddress('📍 Unable to get location');
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    setLoading(true);
    setError(null);
    await getLocation();
  };

  const renderCrecheCard = (creche: any) => (
    <Pressable 
      key={creche.id} 
      style={styles.crecheCard}
      onPress={() => router.push(`/search/${creche.id}`)}
    >
      <Image source={{ uri: creche.image }} style={styles.crecheImage} />
      
      {creche.verified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓</Text>
        </View>
      )}
      
      <View style={styles.crecheContent}>
        <Text style={styles.crecheName}>{creche.name}</Text>
        
        <View style={styles.crecheInfo}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.rating}>{creche.rating}</Text>
            <Text style={styles.reviews}>({creche.reviews})</Text>
          </View>
          
          <View style={styles.locationContainer}>
            <MapPin size={12} color="#9ca3af" />
            <Text style={styles.location}>{creche.location} • {creche.distance}</Text>
          </View>
        </View>
        
        <Text style={styles.price}>{creche.price}</Text>
      </View>
    </Pressable>
  );

  const renderSpotCard = (spot: any) => (
    <Pressable 
      key={spot.id} 
      style={styles.spotCard}
      onPress={() => router.push(`/search/${spot.id}`)}
    >
      <Image source={{ uri: spot.image }} style={styles.spotImage} />
      
      <View style={styles.spotContent}>
        <Text style={styles.spotCrecheName}>{spot.crecheName}</Text>
        
        <View style={styles.spotAvailability}>
          <View style={styles.spotsContainer}>
            <Users size={12} color="#22c55e" />
            <Text style={styles.spotsText}>{spot.spotsAvailable} spots left</Text>
          </View>
          <Text style={styles.ageGroup}>{spot.ageGroup}</Text>
        </View>
        
        <View style={styles.spotDetails}>
          <View style={styles.detailRow}>
            <MapPin size={12} color="#9ca3af" />
            <Text style={styles.detailText}>{spot.location} • {spot.distance}</Text>
          </View>
          <Text style={styles.duration}>{spot.duration}</Text>
        </View>
        
        <View style={styles.spotFooter}>
          <Text style={styles.spotPrice}>{spot.price}</Text>
          <Pressable style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Book Now</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable 
              style={styles.menuButton}
              onPress={() => setSideMenuVisible(true)}
            >
              <Menu size={24} color="#374151" />
            </Pressable>
            
            <View style={styles.logoContainer}>
              {/* Top Text: CRECHE */}
              <View style={styles.topTextContainer}>
                <View style={[styles.letterBlock, { backgroundColor: '#f68484' }]}>
                  <Text style={styles.letterText}>C</Text>
                </View>
                <View style={[styles.letterBlock, { backgroundColor: '#9cdcb8' }]}>
                  <Text style={styles.letterText}>R</Text>
                </View>
                <View style={[styles.letterBlock, { backgroundColor: '#84a7f6' }]}>
                  <Text style={styles.letterText}>E</Text>
                </View>
                <View style={[styles.letterBlock, { backgroundColor: '#f6cc84' }]}>
                  <Text style={styles.letterText}>C</Text>
                </View>
                <View style={[styles.letterBlock, { backgroundColor: '#bd84f6' }]}>
                  <Text style={styles.letterText}>H</Text>
                </View>
                <View style={[styles.letterBlock, { backgroundColor: '#f68484' }]}>
                  <Text style={styles.letterText}>E</Text>
                </View>
              </View>
              
              {/* Bottom Text: SPOTS */}
              <View style={styles.bottomTextContainer}>
                <View style={[styles.letterBlock, { backgroundColor: '#84a7f6' }]}>
                  <Text style={styles.letterText}>S</Text>
                </View>
                <View style={[styles.letterBlock, { backgroundColor: '#f6cc84' }]}>
                  <Text style={styles.letterText}>P</Text>
                </View>
                <View style={[styles.letterBlock, { backgroundColor: '#f68484' }]}>
                  <Text style={styles.letterText}>O</Text>
                </View>
                <View style={[styles.letterBlock, { backgroundColor: '#9cdcb8' }]}>
                  <Text style={styles.letterText}>T</Text>
                </View>
                <View style={[styles.letterBlock, { backgroundColor: '#bd84f6' }]}>
                  <Text style={styles.letterText}>S</Text>
                </View>
              </View>
            </View>
            
            <Pressable style={styles.notificationButton}>
              <Bell size={24} color="#374151" />
              <View style={styles.notificationBadge} />
            </Pressable>
          </View>
          
          <Text style={styles.welcomeText}>Find trusted childcare near you</Text>
          
          {/* Location with refresh button */}
          <View style={styles.locationRow}>
            {loading ? (
              <ActivityIndicator size="small" color="#6b7280" />
            ) : (
              <Navigation size={16} color="#6b7280" />
            )}
            <Pressable onPress={refreshLocation} style={styles.locationPressable}>
              <Text style={styles.locationText}>
                {address}
              </Text>
            </Pressable>
            {error && (
              <Text style={styles.locationError}>{error}</Text>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable style={[styles.actionButton, { backgroundColor: '#f68484' }]}>
            <Text style={styles.actionEmoji}>🔍</Text>
            <Text style={styles.actionText}>Find Care</Text>
          </Pressable>
          
          <Pressable style={[styles.actionButton, { backgroundColor: '#9cdcb8' }]}>
            <Text style={styles.actionEmoji}>📅</Text>
            <Text style={styles.actionText}>My Bookings</Text>
          </Pressable>
          
          <Pressable style={[styles.actionButton, { backgroundColor: '#84a7f6' }]}>
            <Text style={styles.actionEmoji}>⭐</Text>
            <Text style={styles.actionText}>Reviews</Text>
          </Pressable>
          
          <Pressable style={[styles.actionButton, { backgroundColor: '#f6cc84' }]}>
            <Text style={styles.actionEmoji}>💬</Text>
            <Text style={styles.actionText}>Messages</Text>
          </Pressable>
        </View>

        {/* Featured Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Creches</Text>
          <Text style={styles.sectionSubtitle}>Highly rated childcare near you</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.crechesContainer}>
              {featuredCreches.map(renderCrecheCard)}
            </View>
          </ScrollView>
        </View>

        {/* Available Spots Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Spots</Text>
          <Text style={styles.sectionSubtitle}>Limited availability - Book now!</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.spotsListContainer}>
              {availableSpots.map(renderSpotCard)}
            </View>
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#9cdcb8' }]}>
              <Clock size={16} color="#ffffff" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Booking Confirmed</Text>
              <Text style={styles.activityDescription}>
                Little Learners Academy - Tomorrow at 8:00 AM
              </Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#84a7f6' }]}>
              <Star size={16} color="#ffffff" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Review Reminder</Text>
              <Text style={styles.activityDescription}>
                How was your experience at Happy Kids Daycare?
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <SideMenu 
        visible={sideMenuVisible} 
        onClose={() => setSideMenuVisible(false)} 
      />
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
  logoContainer: {
    alignItems: 'center',
  },
  topTextContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bottomTextContainer: {
    flexDirection: 'row',
  },
  letterBlock: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
    opacity: 0.9,
  },
  letterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
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
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationPressable: {
    marginLeft: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
  },
  locationError: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    opacity: 0.9,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  crechesContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  crecheCard: {
    width: width * 0.75,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  crecheImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#e5e7eb',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  crecheContent: {
    padding: 16,
  },
  crecheName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  crecheInfo: {
    marginBottom: 8,
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
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#bd4ab5',
  },
  // Spot Card Styles
  spotsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  spotCard: {
    width: width * 0.8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  spotImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#e5e7eb',
  },
  spotContent: {
    padding: 16,
  },
  spotCrecheName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  spotAvailability: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotsText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
    marginLeft: 4,
  },
  ageGroup: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  spotDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  duration: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  spotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#bd4ab5',
  },
  bookButton: {
    backgroundColor: '#bd4ab5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
});