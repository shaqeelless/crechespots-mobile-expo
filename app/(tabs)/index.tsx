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

export default function HomeScreen() {
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [creches, setCreches] = useState<Creche[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchNearbyCreches();
  }, []);

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

  const renderCrecheCard = (creche: Creche) => (
    <Pressable 
      key={creche.id} 
      style={styles.crecheCard}
      onPress={() => router.push(`/search/${creche.id}`)}
    >
      <Image
        source={{
          uri: creche.header_image || 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg',
        }}
        style={styles.crecheImage}
      />
      
      {creche.registered && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓</Text>
        </View>
      )}
      
      <View style={styles.crecheContent}>
        <Text style={styles.crecheName}>{creche.name}</Text>
        
        <View style={styles.crecheInfo}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.rating}>4.8</Text>
            <Text style={styles.reviews}>(124)</Text>
          </View>
          
          <View style={styles.locationContainer}>
            <MapPin size={12} color="#9ca3af" />
            <Text style={styles.location}>
              {creche.suburb}, {creche.city}
            </Text>
          </View>
        </View>
        
        <Text style={styles.price}>
          {creche.monthly_price
            ? `R${creche.monthly_price}/month`
            : creche.weekly_price
            ? `R${creche.weekly_price}/week`
            : creche.price
            ? `R${creche.price}/day`
            : 'Contact for pricing'}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#2563eb']}
            tintColor={'#2563eb'}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable style={styles.menuButton} onPress={() => setSideMenuVisible(true)}>
              <Menu size={24} color="#374151" />
            </Pressable>
            
            <View style={styles.logoContainer}>
              <View style={[styles.letterBlock, { backgroundColor: '#f68484' }]}>
                <Text style={styles.letterText}>C</Text>
              </View>
              <View style={[styles.letterBlock, { backgroundColor: '#f68484' }]}>
                <Text style={styles.letterText}>R</Text>
              </View>
              <View style={[styles.letterBlock, { backgroundColor: '#9cdcb8' }]}>
                <Text style={styles.letterText}>E</Text>
              </View>
              <View style={[styles.letterBlock, { backgroundColor: '#84a7f6' }]}>
                <Text style={styles.letterText}>C</Text>
              </View>
              <View style={[styles.letterBlock, { backgroundColor: '#f6cc84' }]}>
                <Text style={styles.letterText}>H</Text>
              </View>
              <View style={[styles.letterBlock, { backgroundColor: '#bd84f6' }]}>
                <Text style={styles.letterText}>E</Text>
              </View>
            </View>
            
            <Pressable style={styles.notificationButton}>
              <Bell size={24} color="#374151" />
              <View style={styles.notificationBadge} />
            </Pressable>
          </View>
          
          <Text style={styles.welcomeText}>
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}!
          </Text>
          <Text style={styles.locationText}>
            📍{' '}
            {profile
              ? [profile.suburb, profile.city, profile.province].filter(Boolean).join(', ') ||
                'Update your location in profile'
              : 'Loading location...'}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable 
            style={[styles.actionButton, { backgroundColor: '#f68484' }]}
            onPress={() => router.push('/search')}
          >
            <Text style={styles.actionEmoji}>🔍</Text>
            <Text style={styles.actionText}>Find Creches</Text>
          </Pressable>
          
          <Pressable
            style={[styles.actionButton, { backgroundColor: '#9cdcb8' }]}
            onPress={() => router.push('/children')}
          >
            <Text style={styles.actionEmoji}>👶</Text>
            <Text style={styles.actionText}>My Children</Text>
          </Pressable>
          
          <Pressable
            style={[styles.actionButton, { backgroundColor: '#84a7f6' }]}
            onPress={() => router.push('/applications')}
          >
            <Text style={styles.actionEmoji}>📋</Text>
            <Text style={styles.actionText}>Applications</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.actionButton, { backgroundColor: '#f6cc84' }]}
            onPress={() => router.push('/feeds')}
          >
            <Text style={styles.actionEmoji}>📰</Text>
            <Text style={styles.actionText}>Feeds</Text>
          </Pressable>
        </View>

        {/* Nearby Creches Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Creches</Text>
          <Text style={styles.sectionSubtitle}>Accepting applications in your area</Text>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={fetchNearbyCreches}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            </View>
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading creches...</Text>
            </View>
          ) : creches.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.crechesScrollContent}
            >
              <View style={styles.crechesContainer}>
                {creches.map(renderCrecheCard)}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No creches found in your area</Text>
              <Pressable style={styles.retryButton} onPress={fetchNearbyCreches}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Application Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Status</Text>
          
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#f59e0b' }]}>
              <Clock size={16} color="#ffffff" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Under Review</Text>
              <Text style={styles.activityDescription}>
                2 applications are currently being reviewed by creches
              </Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#22c55e' }]}>
              <Users size={16} color="#ffffff" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Application Accepted</Text>
              <Text style={styles.activityDescription}>
                Sunshine Daycare accepted your application for Emma
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

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
    color: '#2563eb',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
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
    backgroundColor: '#2563eb',
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
});