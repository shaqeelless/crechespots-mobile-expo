import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

const FloatingNotificationBadge: React.FC = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    // Pulsing animation for notification badge
    scale.value = withRepeat(
      withSequence(
        withSpring(1, { damping: 2, stiffness: 100 }),
        withSpring(1.2, { damping: 2, stiffness: 100 }),
        withSpring(1, { damping: 2, stiffness: 100 })
      ),
      -1, // Infinite repeat
      true // Reverse
    );
    opacity.value = withTiming(1, { duration: 500 });
  }, []);

  return (
    <Animated.View style={[styles.notificationBadge, animatedStyle]} />
  );
};

const styles = StyleSheet.create({
  notificationBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default FloatingNotificationBadge;