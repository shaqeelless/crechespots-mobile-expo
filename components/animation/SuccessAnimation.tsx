// components/animations/SuccessAnimation.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface SuccessAnimationProps {
  size?: number;
  autoPlay?: boolean;
  loop?: boolean;
  onAnimationFinish?: () => void;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  size = 200,
  autoPlay = true,
  loop = false,
  onAnimationFinish,
}) => {
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (autoPlay && Platform.OS !== 'web') {
      animationRef.current?.play();
    }
  }, [autoPlay]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <DotLottieReact
          src="https://lottie.host/b6e8a86c-ab25-4d67-a925-3b343636293b/SY1IXt6wHF.lottie"
          loop={loop}
          autoplay={autoPlay}
          style={styles.animation}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LottieView
        ref={animationRef}
        source={require('@/assets/animation/Success.json')}
        autoPlay={autoPlay}
        loop={loop}
        style={styles.animation}
        onAnimationFinish={onAnimationFinish}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});