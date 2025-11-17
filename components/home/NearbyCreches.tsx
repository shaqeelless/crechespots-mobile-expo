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
  return (
    <Animated.View 
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
          <Pressable style={styles.retryButton} onPress={onRetry}>
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
});

export default NearbyCreches;