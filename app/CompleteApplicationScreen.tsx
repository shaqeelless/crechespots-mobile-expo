import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable,
  Dimensions,
  SafeAreaView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Home, CheckCircle } from 'lucide-react-native';
import { SuccessAnimation } from '@/components/animation/SuccessAnimation';

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

export default function CompleteApplicationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    crecheName?: string;
    childName?: string;
    className?: string;
  }>();

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <AnimatedView
          style={styles.animationContainer}
          entering={FadeIn.duration(600)}
        >
          <SuccessAnimation size={200} autoPlay loop={false} />
        </AnimatedView>

        {/* Success Icon */}
        <AnimatedView 
          style={styles.successIconContainer}
          entering={FadeInDown.delay(200).duration(600)}
        >
          <CheckCircle size={32} color="#10b981" />
        </AnimatedView>

        {/* Title */}
        <AnimatedText 
          style={styles.title}
          entering={FadeInDown.delay(300).duration(600)}
        >
          Application Submitted!
        </AnimatedText>

        {/* Message */}
        <AnimatedText 
          style={styles.message}
          entering={FadeInUp.delay(400).duration(600)}
        >
          Thank you for applying to{' '}
          <Text style={styles.crecheName}>{params.crecheName || 'Creche'}</Text>
        </AnimatedText>

        {/* Simple Details */}
        <AnimatedView 
          style={styles.detailsContainer}
          entering={FadeInUp.delay(500).duration(600)}
        >
          {params.childName && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Child:</Text>
              <Text style={styles.detailValue}>{params.childName}</Text>
            </View>
          )}
          
          {params.className && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Class:</Text>
              <Text style={styles.detailValue}>{params.className}</Text>
            </View>
          )}
          
          <View style={styles.statusItem}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Under Review</Text>
            </View>
          </View>
        </AnimatedView>

        {/* Simple Note */}
        <AnimatedText 
          style={styles.note}
          entering={FadeInUp.delay(600).duration(600)}
        >
          You'll receive an email confirmation shortly.
        </AnimatedText>

        {/* Home Button */}
        <AnimatedPressable
          style={styles.homeButton}
          onPress={handleGoHome}
          entering={FadeInUp.delay(700).duration(600)}
        >
          <Home size={20} color="#ffffff" />
          <Text style={styles.homeButtonText}>Go Home</Text>
        </AnimatedPressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  crecheName: {
    fontWeight: 'bold',
    color: '#bd84f6',
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
  },
  note: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#bd84f6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    maxWidth: 280,
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});