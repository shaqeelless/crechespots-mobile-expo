import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);

const AnimatedSkeleton: React.FC = () => {
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
        styles.skeletonShimmer,
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeletonShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default AnimatedSkeleton;