import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

const BottomSpaces: React.FC = () => {
  return (
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
  );
};

const styles = StyleSheet.create({
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
});

export default BottomSpaces;