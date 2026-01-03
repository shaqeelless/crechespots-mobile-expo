import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';

import { MapPin, Star } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedImage = Animated.createAnimatedComponent(Image);

interface Creche {
  id: string;
  name: string;
  header_image: string;
  logo: string;
  suburb: string;
  city: string;
  monthly_price: number;
  weekly_price: number;
  price: number;
  registered: boolean;
}

interface AnimatedCrecheCardProps {
  creche: Creche;
  index: number;
  onPress: () => void;
}

const AnimatedCrecheCard: React.FC<AnimatedCrecheCardProps> = ({
  creche,
  index,
  onPress,
}) => {
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
      <AnimatedImage
        source={{
          uri: creche.logo || 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg',
        }}
        style={[styles.crecheImage, imageAnimatedStyle]}
        resizeMode="cover"
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

const styles = StyleSheet.create({
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
    fontSize: 12,
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
    fontSize: 12,
  },
  reviews: {
    marginLeft: 4,
    color: '#6b7280',
    fontSize: 12,
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
    fontSize: 14,
  },
});

export default AnimatedCrecheCard;