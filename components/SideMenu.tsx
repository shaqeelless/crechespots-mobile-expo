import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { User, Settings, CreditCard, CircleHelp, Shield, LogOut, X, Star, Calendar, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function SideMenu({ visible, onClose }: SideMenuProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleMenuItemPress = (route: string) => {
    onClose(); // Close the menu first
    // Small delay to allow menu to close before navigation
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const handleLogout = () => {
    onClose();
    // Add your logout logic here
    console.log('Logout pressed');
    // Example: router.replace('/login');
  };

  const menuItems = [
    { icon: MapPin, label: 'Saved Locations', color: '#f6cc84', route: '/favorites' },
    { icon: Settings, label: 'Settings', color: '#f684a3', route: '/settings' },
    { icon: CircleHelp, label: 'Help & Support', color: '#9cdcb8', route: '/help-support' },
    { icon: Shield, label: 'Safety Center', color: '#84a7f6', route: '/safety-centre' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <StatusBar 
          backgroundColor="rgba(0, 0, 0, 0.5)" 
          barStyle="light-content"
        />
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <Animated.View 
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header with close button */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('@/assets/images/SplashScreen.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#374151" />
              </Pressable>
            </View>


            {/* Menu Items */}
            <View style={styles.menuItems}>
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Pressable 
                    key={index} 
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && styles.menuItemPressed
                    ]}
                    onPress={() => handleMenuItemPress(item.route)}
                  >
                    <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                      <IconComponent size={20} color="#ffffff" />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Pressable 
                style={({ pressed }) => [
                  styles.logoutButton,
                  pressed && styles.logoutButtonPressed
                ]} 
                onPress={handleLogout}
              >
                <LogOut size={20} color="#ef4444" />
                <Text style={styles.logoutText}>Sign Out</Text>
              </Pressable>
              
              <Text style={styles.version}>Version 1.0.1</Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  menuContainer: {
    width: width * 0.8,
    maxWidth: 320,
    backgroundColor: '#ffffff',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 180,
    height: 50,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#bd84f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuItems: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemPressed: {
    backgroundColor: '#f9fafb',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutButtonPressed: {
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
    marginLeft: 12,
  },
  version: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
  },
});