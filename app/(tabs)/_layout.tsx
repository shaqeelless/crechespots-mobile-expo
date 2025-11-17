import { Tabs } from 'expo-router';
import { Chrome as Home, Bell, Baby, BookOpen, User } from 'lucide-react-native';
import { useEffect } from 'react';
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
const TAB_BAR_WIDTH = SCREEN_WIDTH - 40; // Account for left/right margins (20 + 20)
const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;

// Fixed Floating Background Indicator
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
    // Calculate the correct position within the tab bar
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
          left: 0, // Start from the left edge of the tab bar
          width: TAB_WIDTH, // Match individual tab width
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

// Enhanced Floating Tab Icon
const FloatingTabIcon = ({ focused, children, index, onPress, label }) => {
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
      }}
    >
      <Animated.View style={iconAnimatedStyle}>
        {children}
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

// Fixed Custom Tab Bar
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        width: TAB_BAR_WIDTH, // Explicit width
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
      {/* Fixed Background Indicator */}
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

// Debug version to test positioning
export function DebugTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          height: 70,
          backgroundColor: '#ffffff',
          borderRadius: 25,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
          borderWidth: 1,
          borderColor: '#f0f0f0',
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#bd84f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color, focused }) => (
            <DebugFloatingIcon focused={focused} index={0}>
              <Home size={size} color={color} />
            </DebugFloatingIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ size, color, focused }) => (
            <DebugFloatingIcon focused={focused} index={1}>
              <Search size={size} color={color} />
            </DebugFloatingIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ size, color, focused }) => (
            <DebugFloatingIcon focused={focused} index={2}>
              <Heart size={size} color={color} />
            </DebugFloatingIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="feeds"
        options={{
          title: 'Feeds',
          tabBarIcon: ({ size, color, focused }) => (
            <DebugFloatingIcon focused={focused} index={3}>
              <BookOpen size={size} color={color} />
            </DebugFloatingIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color, focused }) => (
            <DebugFloatingIcon focused={focused} index={4}>
              <User size={size} color={color} />
            </DebugFloatingIcon>
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