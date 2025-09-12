import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { Heart, Star, MapPin } from 'lucide-react-native';

const favoriteCreches = [
  {
    id: 1,
    name: 'Little Learners Academy',
    image: 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg',
    rating: 4.9,
    reviews: 127,
    location: 'Downtown',
    price: '€45/day',
    savedDate: '2 days ago',
  },
  {
    id: 2,
    name: 'Sunshine Daycare',
    image: 'https://images.pexels.com/photos/8535334/pexels-photo-8535334.jpeg',
    rating: 4.8,
    reviews: 92,
    location: 'Northside',
    price: '€42/day',
    savedDate: '1 week ago',
  },
];

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <Text style={styles.headerSubtitle}>Your saved childcare options</Text>
      </View>

      <ScrollView style={styles.content}>
        {favoriteCreches.map((creche) => (
          <View key={creche.id} style={styles.favoriteCard}>
            <Image source={{ uri: creche.image }} style={styles.favoriteImage} />
            
            <View style={styles.favoriteContent}>
              <View style={styles.favoriteHeader}>
                <Text style={styles.favoriteName}>{creche.name}</Text>
                <Pressable style={styles.heartButton}>
                  <Heart size={20} color="#ef4444" fill="#ef4444" />
                </Pressable>
              </View>
              
              <View style={styles.favoriteInfo}>
                <View style={styles.ratingContainer}>
                  <Star size={14} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.rating}>{creche.rating}</Text>
                  <Text style={styles.reviews}>({creche.reviews})</Text>
                </View>
                
                <View style={styles.locationContainer}>
                  <MapPin size={12} color="#9ca3af" />
                  <Text style={styles.location}>{creche.location}</Text>
                </View>
              </View>
              
              <View style={styles.favoriteFooter}>
                <Text style={styles.price}>{creche.price}</Text>
                <Text style={styles.savedDate}>Saved {creche.savedDate}</Text>
              </View>
            </View>
          </View>
        ))}
        
        {favoriteCreches.length === 0 && (
          <View style={styles.emptyState}>
            <Heart size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyDescription}>
              Start exploring and save your favorite creches to see them here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  favoriteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  favoriteImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#e5e7eb',
  },
  favoriteContent: {
    padding: 16,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteInfo: {
    marginBottom: 12,
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
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  favoriteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bd4ab5',
  },
  savedDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});