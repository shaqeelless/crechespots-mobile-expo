import { Tabs } from 'expo-router';
import { Chrome as Home, Bell, Baby, BookOpen, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Pressable, View, Dimensions, Text } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_COUNT = 5;
const TAB_BAR_WIDTH = SCREEN_WIDTH - 40;
const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;

// Add notification context or state management
import { useNotificationCount } from '@/context/NotificationContext'; // You'll need to create this

// Enhanced Tab Icon with Notification Badge
const FloatingTabIcon = ({ focused, children, index, onPress, label, notificationCount = 0 }) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      opacity: opacity.value,
      zIndex: 10,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            translateY.value,
            [0, -8],
            [0, -2],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        translateY.value,
        [0, -8],
        [0.7, 1],
        Extrapolate.CLAMP
      ),
      color: focused ? '#ffffff' : '#9ca3af',
    };
  });

  useEffect(() => {
    if (focused) {
      translateY.value = withSpring(-8, {
        damping: 12,
        stiffness: 140,
        mass: 0.7,
      });
      scale.value = withSpring(1.2, {
        damping: 12,
        stiffness: 140,
        mass: 0.7,
      });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withSpring(0, {
        damping: 12,
        stiffness: 140,
        mass: 0.7,
      });
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 140,
        mass: 0.7,
      });
      opacity.value = withTiming(0.8, { duration: 200 });
    }
  }, [focused]);

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        position: 'relative',
      }}
    >
      <Animated.View style={iconAnimatedStyle}>
        {children}
        
        {/* Notification Badge */}
        {notificationCount > 0 && label === 'Notification' && (
          <View style={{
            position: 'absolute',
            top: -6,
            right: -6,
            backgroundColor: '#ef4444',
            borderRadius: 10,
            minWidth: 18,
            height: 18,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: focused ? '#bd84f6' : 'rgba(255, 255, 255, 0.95)',
            zIndex: 20,
          }}>
            <Text style={{
              color: '#ffffff',
              fontSize: 10,
              fontWeight: '700',
              textAlign: 'center',
              lineHeight: 12,
            }}>
              {notificationCount > 9 ? '9+' : notificationCount}
            </Text>
          </View>
        )}
      </Animated.View>
      
      <Animated.Text
        style={[
          {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
            textAlign: 'center',
          },
          textAnimatedStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
};

// Fixed Floating Background Indicator (keep this the same)
const FloatingBackground = ({ activeIndex }) => {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value }
      ],
    };
  });

  useEffect(() => {
    const targetPosition = activeIndex * TAB_WIDTH;
    translateX.value = withSpring(targetPosition, {
      damping: 15,
      stiffness: 120,
      mass: 0.8,
    });
    
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
  }, [activeIndex]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          width: TAB_WIDTH,
          height: 65,
          backgroundColor: '#bd84f6',
          borderRadius: 16,
          shadowColor: '#bd84f6',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
          zIndex: 0,
        },
        animatedStyle,
      ]}
    />
  );
};

// Fixed Custom Tab Bar with Notification Support
const CustomTabBar = ({ state, descriptors, navigation }) => {
  // You can replace this with actual notification count from your context/API
  const [notificationCount, setNotificationCount] = useState(3); // Mock data - replace with real data
  
  // You could fetch the actual count here or use context
  // const { unreadCount } = useNotificationCount();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        width: TAB_BAR_WIDTH,
        height: 70,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 25,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        overflow: 'hidden',
      }}
    >
      <FloatingBackground activeIndex={state.index} />
      
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const IconComponent = options.tabBarIcon;

        return (
          <FloatingTabIcon
            key={route.key}
            focused={isFocused}
            index={index}
            onPress={onPress}
            label={label}
            notificationCount={label === 'Notification' ? notificationCount : 0}
          >
            <IconComponent
              size={22}
              color={isFocused ? '#ffffff' : '#9ca3af'}
              focused={isFocused}
            />
          </FloatingTabIcon>
        );
      })}
    </View>
  );
};

// Main Tab Layout
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color, focused }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feeds"
        options={{
          title: 'Feeds',
          tabBarIcon: ({ size, color, focused }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="child"
        options={{
          title: 'Child',
          tabBarIcon: ({ size, color, focused }) => (
            <Baby size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notification',
          tabBarIcon: ({ size, color, focused }) => (
            <Bell size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color, focused }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// Debug version with background
const DebugFloatingIcon = ({ focused, children, index }) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      backgroundColor: focused ? '#bd84f6' : 'transparent',
      padding: focused ? 8 : 0,
      borderRadius: focused ? 20 : 0,
    };
  });

  useEffect(() => {
    if (focused) {
      translateY.value = withSpring(-6, {
        damping: 15,
        stiffness: 150,
      });
      scale.value = withSpring(1.15, {
        damping: 15,
        stiffness: 150,
      });
    } else {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }
  }, [focused]);

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
};