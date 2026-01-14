import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInUp, BounceIn } from 'react-native-reanimated';
import AnimatedCrecheCard from './AnimatedCrecheCard';

const AnimatedView = Animated.createAnimatedComponent(View);

interface NearbyCrechesProps {
  currentLocation: any;
  error: string | null;
  creches: any[];
  router: any;
  onRetry: () => void;
  onChangeLocation: () => void;
}

const NearbyCreches: React.FC<NearbyCrechesProps> = ({
  currentLocation,
  error,
  creches,
  router,
  onRetry,
  onChangeLocation,
}) => {
  // Get location name for display
  const getLocationName = () => {
    if (currentLocation.suburb && currentLocation.suburb !== currentLocation.city) {
      return `${currentLocation.suburb}, ${currentLocation.city}`;
    }
    return currentLocation.city || currentLocation.suburb || 'your area';
  };

  // Get search radius info
  const getSearchInfo = () => {
    if (currentLocation.latitude && currentLocation.longitude) {
      const nearbyCount = creches.filter(c => c.distance && c.distance <= 15).length;
      const totalCount = creches.length;
      
      if (nearbyCount > 0) {
        return `Showing ${totalCount} creches (${nearbyCount} within 15km)`;
      }
      return 'Sorted by distance from your location';
    }
    return 'Accepting applications in your area';
  };

  return (
    <Animated.View 
      style={styles.section}
      entering={FadeInUp.delay(1100).duration(800).springify()}
    >
      <Text style={styles.sectionTitle}>
        {currentLocation.city ? `Nearby Creches in ${getLocationName()}` : 'Nearby Creches'}
      </Text>
      <Text style={styles.sectionSubtitle}>{getSearchInfo()}</Text>
      
      {error ? (
        <AnimatedView 
          style={styles.errorContainer}
          entering={BounceIn.duration(800)}
        >
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>📍</Text>
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.retryButton, styles.secondaryButton]} onPress={onChangeLocation}>
              <Text style={styles.retryButtonText}>Change Location</Text>
            </Pressable>
            <Pressable style={styles.retryButton} onPress={onRetry}>
              <Text style={styles.retryButtonText}>Retry Search</Text>
            </Pressable>
          </View>
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
                distance={creche.distance}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <AnimatedView 
          style={styles.emptyContainer}
          entering={BounceIn.duration(800)}
        >
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>🏫</Text>
          </View>
          <Text style={styles.emptyText}>No creches found in {getLocationName()}</Text>
          <Text style={styles.emptySubtext}>
            {currentLocation.latitude && currentLocation.longitude 
              ? 'Try expanding your search radius or selecting a different location'
              : 'Try selecting a different location'
            }
          </Text>
          <Pressable 
            style={styles.retryButton} 
            onPress={onChangeLocation}
          >
            <Text style={styles.retryButtonText}>Change Location</Text>
          </Pressable>
        </AnimatedView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 28,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 28,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#bd84f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default NearbyCreches;