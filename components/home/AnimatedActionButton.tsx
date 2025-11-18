import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Use TouchableOpacity instead of View for the animated component
const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedActionButtonProps {
  icon: React.ComponentType<any>;
  text: string;
  backgroundColor: string;
  delay: number;
  onPress: () => void;
}

const AnimatedActionButton: React.FC<AnimatedActionButtonProps> = ({
  icon: Icon,
  text,
  backgroundColor,
  delay,
  onPress,
}) => {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            translateY.value,
            [50, 0],
            [10, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        translateY.value,
        [50, 0],
        [0, 1],
        Extrapolate.CLAMP
      ),
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withSpring(0, {
        damping: 12,
        stiffness: 100,
        mass: 0.8,
      });
      opacity.value = withTiming(1, { duration: 600 });
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 100,
      });
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const handlePress = () => {
    console.log(`🔼 AnimatedActionButton "${text}" pressed`);
    console.log(`🔍 onPress function available: ${typeof onPress === 'function'}`);
    
    if (typeof onPress === 'function') {
      onPress();
    } else {
      console.error('❌ onPress is not a function');
    }
  };

  return (
    <View style={styles.actionButtonContainer}>
      <AnimatedPressable 
        style={[styles.actionButton, { backgroundColor }, animatedStyle]}
        onPress={handlePress}
        activeOpacity={0.7} // Add feedback when pressed
      >
        <Icon size={24} color="#ffffff" />
      </AnimatedPressable>
      <Animated.Text style={[styles.actionButtonText, textAnimatedStyle]}>
        {text}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtonContainer: {
    alignItems: 'center',
    width: (width - 60) / 4,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});

export default AnimatedActionButton;