import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { Menu, Bell, MapPin, Star, Clock } from 'lucide-react-native';
import SideMenu from '@/components/SideMenu';

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

export default function HomeScreen() {
  const [sideMenuVisible, setSideMenuVisible] = useState(false);

  const renderCrecheCard = (creche: any) => (
    <Pressable key={creche.id} style={styles.crecheCard}>
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
          
          <Text style={styles.welcomeText}>Find trusted childcare near you</Text>
          <Text style={styles.locationText}>📍 Dublin, Ireland</Text>
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
  locationText: {
    fontSize: 14,
    color: '#6b7280',
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