import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

interface AnimatedActivityItemProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  backgroundColor: string;
  delay: number;
}

const AnimatedActivityItem: React.FC<AnimatedActivityItemProps> = ({
  icon: Icon,
  title,
  description,
  backgroundColor,
  delay,
}) => {
  const translateX = useSharedValue(-50);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      translateX.value = withSpring(0, {
        damping: 12,
        stiffness: 100,
      });
      opacity.value = withTiming(1, { duration: 600 });
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatedView style={[styles.activityItem, animatedStyle]}>
      <View style={[styles.activityIcon, { backgroundColor }]}>
        <Icon size={16} color="#ffffff" />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityDescription}>{description}</Text>
      </View>
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
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
});

export default AnimatedActivityItem;