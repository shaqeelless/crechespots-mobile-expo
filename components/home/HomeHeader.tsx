import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { Menu, Bell, MapPin, ChevronDown } from 'lucide-react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import FloatingNotificationBadge from './FloatingNotificationBadge';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

interface HomeHeaderProps {
  headerAnimatedStyle: any;
  onMenuPress: () => void;
  profile: any;
  locationLoading: boolean;
  currentLocation: any;
  onLocationPress: () => void;
  getCurrentLocation: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  headerAnimatedStyle,
  onMenuPress,
  profile,
  locationLoading,
  currentLocation,
  onLocationPress,
}) => {
  const getLocationDisplayText = () => {
    if (locationLoading) {
      return 'Detecting location...';
    }
    if (currentLocation.suburb && currentLocation.city) {
      return `${currentLocation.suburb}, ${currentLocation.city}`;
    } else if (currentLocation.city) {
      return currentLocation.city;
    } else if (currentLocation.province) {
      return currentLocation.province;
    }
    return 'Select your location';
  };

  return (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <View style={styles.headerTop}>
        <AnimatedPressable style={styles.menuButton} onPress={onMenuPress}>
          <Menu size={24} color="#374151" />
        </AnimatedPressable>
        
        <AnimatedView 
          style={styles.logoContainer}
          entering={ZoomIn.duration(800).springify()}
        >
          <Image 
            source={require('@/assets/images/SplashScreen.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </AnimatedView>
        
        <AnimatedPressable style={styles.notificationButton}>
          <Bell size={24} color="#374151" />
          <FloatingNotificationBadge />
        </AnimatedPressable>
      </View>
      
      <AnimatedText 
        style={styles.welcomeText}
        entering={FadeInUp.delay(200).duration(800).springify()}
      >
        Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}!
      </AnimatedText>
      
      <Pressable 
        style={styles.locationSelector}
        onPress={onLocationPress}
        disabled={locationLoading}
      >
        <MapPin size={16} color="#bd84f6" />
        <AnimatedText 
          style={[
            styles.locationText,
            locationLoading && styles.locationTextLoading
          ]}
          entering={FadeInUp.delay(400).duration(800).springify()}
        >
          {getLocationDisplayText()}
        </AnimatedText>
        {!locationLoading && <ChevronDown size={16} color="#bd84f6" />}
        {locationLoading && (
          <View style={styles.loadingSpinner}>
            <Text style={styles.loadingSpinnerText}>⟳</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderEndEndRadius: 150,
    backgroundColor: '#ffffff',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 200,
    height: 60,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 14,
    color: '#bd84f6',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  locationTextLoading: {
    color: '#9ca3af',
  },
  loadingSpinner: {
    marginLeft: 4,
  },
  loadingSpinnerText: {
    fontSize: 14,
    color: '#bd84f6',
  },
});

export default HomeHeader;