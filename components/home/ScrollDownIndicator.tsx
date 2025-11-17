import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

interface ScrollDownIndicatorProps {
  scrollY: any;
  contentHeight: any;
}

const ScrollDownIndicator: React.FC<ScrollDownIndicatorProps> = ({
  scrollY,
  contentHeight,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const shouldShow = scrollY.value < contentHeight.value - height * 1.5;
    
    return {
      opacity: shouldShow ? 1 : 0,
      transform: [
        { 
          translateY: withSpring(shouldShow ? 0 : 20, {
            damping: 15,
            stiffness: 100,
          })
        }
      ],
    };
  });

  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withRepeat(
            withSequence(
              withTiming(-2, { duration: 800 }),
              withTiming(2, { duration: 800 })
            ),
            -1,
            true
          )
        }
      ]
    };
  });

  return (
    <AnimatedView style={[styles.scrollIndicator, animatedStyle]}>
      <AnimatedText style={styles.scrollIndicatorText}>
        Scroll for more
      </AnimatedText>
      <AnimatedView style={chevronStyle}>
        <ChevronDown size={16} color="#bd84f6" />
      </AnimatedView>
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  scrollIndicator: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: '25%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(189, 132, 246, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scrollIndicatorText: {
    fontSize: 12,
    color: '#bd84f6',
    fontWeight: '600',
    marginBottom: 2,
  },
});

export default ScrollDownIndicator;