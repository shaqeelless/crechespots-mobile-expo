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
import { Menu, Bell, MapPin, Star, Clock, Users, Navigation, Heart, MessageCircle, Share2 } from 'lucide-react-native';
import SideMenu from '@/components/SideMenu';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

const articlePosts = [
  {
    id: 1,
    title: 'Fun Learning Activities for Toddlers',
    content: 'Today we explored colors and shapes with our little ones! The children had so much fun with our rainbow sensory bins and shape sorting games. 🌈',
    author: 'Little Learners Academy',
    authorImage: 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg',
    image: 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg',
    hearts: 24,
    comments: 8,
    location: 'Downtown',
    distance: '0.3 km',
    timeAgo: '2 hours ago',
    crecheId: 1,
  },
  {
    id: 2,
    title: 'Outdoor Play Day Success!',
    content: 'What a beautiful day for outdoor activities! Our children enjoyed nature walks, sandbox play, and garden exploration. Fresh air and exercise are so important for growing minds! 🌱',
    author: 'Happy Kids Daycare',
    authorImage: 'https://images.pexels.com/photos/8613074/pexels-photo-8613074.jpeg',
    image: 'https://images.pexels.com/photos/8613074/pexels-photo-8613074.jpeg',
    hearts: 31,
    comments: 12,
    location: 'City Center',
    distance: '0.8 km',
    timeAgo: '4 hours ago',
    crecheId: 2,
  },
  {
    id: 3,
    title: 'Art & Creativity Workshop',
    content: 'Our little artists created masterpieces today! Finger painting, clay modeling, and collage making. Every child is an artist in their own special way! 🎨',
    author: 'Bright Beginnings',
    authorImage: 'https://images.pexels.com/photos/8535231/pexels-photo-8535231.jpeg',
    image: 'https://images.pexels.com/photos/8535231/pexels-photo-8535231.jpeg',
    hearts: 18,
    comments: 5,
    location: 'Suburbs',
    distance: '1.2 km',
    timeAgo: '6 hours ago',
    crecheId: 3,
  },
];

const myApplications = [
  {
    id: 1,
    childName: 'Emma Smith',
    crecheName: 'Little Learners Academy',
    image: 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg',
    status: 'Under Review',
    appliedDate: '2024-01-15',
    statusColor: '#f6cc84',
    location: 'Downtown',
  },
  {
    id: 2,
    childName: 'Emma Smith',
    crecheName: 'Happy Kids Daycare',
    image: 'https://images.pexels.com/photos/8613074/pexels-photo-8613074.jpeg',
    status: 'Accepted',
    appliedDate: '2024-01-10',
    statusColor: '#9cdcb8',
    location: 'City Center',
  },
  {
    id: 3,
    childName: 'Liam Smith',
    crecheName: 'Bright Beginnings',
    image: 'https://images.pexels.com/photos/8535231/pexels-photo-8535231.jpeg',
    status: 'Pending Documents',
    appliedDate: '2024-01-12',
    statusColor: '#f68484',
    location: 'Suburbs',
  },
];

export default function HomeScreen() {
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('📍 Getting location...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState(articlePosts);
  const [applications, setApplications] = useState(myApplications);
  const router = useRouter();

  useEffect(() => {
    getLocation();
    fetchNearbyPosts();
    fetchMyApplications();
  }, []);

  const fetchNearbyPosts = async () => {
    try {
      // In a real app, this would fetch posts from nearby creches
      // For now, we'll use the mock data
      setPosts(articlePosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchMyApplications = async () => {
    try {
      // Fetch user's applications from Supabase
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          creches(name, header_image),
          children(first_name, last_name)
        `)
        .limit(3);

      if (error) throw error;
      
      if (data) {
        const formattedApplications = data.map(app => ({
          id: app.id,
          childName: `${app.children?.first_name} ${app.children?.last_name}`,
          crecheName: app.creches?.name,
          image: app.creches?.header_image,
          status: app.application_status,
          appliedDate: app.created_at,
          statusColor: getStatusColor(app.application_status),
          location: 'Location', // You might want to add location to creches table
        }));
        setApplications(formattedApplications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      // Keep using mock data on error
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted':
        return '#9cdcb8';
      case 'pending':
      case 'under review':
        return '#f6cc84';
      case 'declined':
      case 'rejected':
        return '#f68484';
      default:
        return '#84a7f6';
    }
  };

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

  const handleLikePost = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, hearts: post.hearts + 1 }
        : post
    ));
  };

  const renderPostCard = (post: any) => (
    <Pressable 
      key={post.id} 
      style={styles.postCard}
      onPress={() => router.push(`/search/${post.crecheId}`)}
    >
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: post.authorImage }} style={styles.authorAvatar} />
        <View style={styles.postHeaderInfo}>
          <Text style={styles.authorName}>{post.author}</Text>
          <View style={styles.postMeta}>
            <MapPin size={12} color="#9ca3af" />
            <Text style={styles.postLocation}>{post.location} • {post.distance}</Text>
            <Text style={styles.postTime}> • {post.timeAgo}</Text>
          </View>
        </View>
      </View>
      
      {/* Post Content */}
      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postContent}>{post.content}</Text>
      
      {/* Post Image */}
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} />
      )}
      
      {/* Post Actions */}
      <View style={styles.postActions}>
        <Pressable 
          style={styles.actionButton}
          onPress={() => handleLikePost(post.id)}
        >
          <Heart size={20} color="#f68484" />
          <Text style={styles.actionText}>{post.hearts}</Text>
        </Pressable>
        
        <Pressable style={styles.actionButton}>
          <MessageCircle size={20} color="#84a7f6" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </Pressable>
        
        <Pressable style={styles.actionButton}>
          <Share2 size={20} color="#9ca3af" />
        </Pressable>
      </View>
    </Pressable>
  );

  const renderApplicationCard = (application: any) => (
    <Pressable 
      key={application.id} 
      style={styles.applicationCard}
      onPress={() => router.push(`/applications/${application.id}`)}
    >
      <Image source={{ uri: application.image }} style={styles.applicationImage} />
      
      <View style={styles.applicationContent}>
        <Text style={styles.applicationChild}>{application.childName}</Text>
        <Text style={styles.applicationCreche}>{application.crecheName}</Text>
        
        <View style={styles.applicationStatus}>
          <View style={[styles.statusBadge, { backgroundColor: application.statusColor }]}>
            <Text style={styles.statusText}>{application.status}</Text>
          </View>
        </View>
        
        <View style={styles.applicationFooter}>
          <Text style={styles.appliedDate}>Applied: {new Date(application.appliedDate).toLocaleDateString()}</Text>
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
          <Pressable 
            style={[styles.quickActionButton, { backgroundColor: '#f68484' }]}
            onPress={() => router.push('/search')}
          >
            <Text style={styles.actionEmoji}>🔍</Text>
            <Text style={styles.quickActionText}>Find Creches</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.quickActionButton, { backgroundColor: '#9cdcb8' }]}
            onPress={() => router.push('/children')}
          >
            <Text style={styles.actionEmoji}>👶</Text>
            <Text style={styles.quickActionText}>My Children</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.quickActionButton, { backgroundColor: '#84a7f6' }]}
            onPress={() => router.push('/applications')}
          >
            <Text style={styles.actionEmoji}>📋</Text>
            <Text style={styles.quickActionText}>Applications</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.quickActionButton, { backgroundColor: '#f6cc84' }]}
            onPress={() => router.push('/(tabs)/messages')}
          >
            <Text style={styles.actionEmoji}>💬</Text>
            <Text style={styles.quickActionText}>Messages</Text>
          </Pressable>
        </View>

        {/* Community Posts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Updates</Text>
          <Text style={styles.sectionSubtitle}>Latest posts from creches near you</Text>
          
          <View style={styles.postsContainer}>
            {posts.map(renderPostCard)}
          </View>
        </View>

        {/* My Applications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Applications</Text>
          <Text style={styles.sectionSubtitle}>Track your application progress</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.applicationsContainer}>
              {applications.map(renderApplicationCard)}
            </View>
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#9cdcb8' }]}>
              <Users size={16} color="#ffffff" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Application Accepted</Text>
              <Text style={styles.activityDescription}>
                Emma's application to Happy Kids Daycare was approved!
              </Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#f6cc84' }]}>
              <Clock size={16} color="#ffffff" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Documents Required</Text>
              <Text style={styles.activityDescription}>
                Please upload vaccination records for Liam's application
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
  quickActionButton: {
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
  quickActionText: {
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
  postsContainer: {
    gap: 20,
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postLocation: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  postTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  applicationsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  applicationCard: {
    width: width * 0.7,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  applicationImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e5e7eb',
  },
  applicationContent: {
    padding: 16,
  },
  applicationChild: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  applicationCreche: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  applicationStatus: {
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  applicationFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
  },
  appliedDate: {
    fontSize: 12,
    color: '#9ca3af',
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