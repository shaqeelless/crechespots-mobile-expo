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
} from 'react-native';
import { User, Settings, CreditCard, CircleHelp, Shield, LogOut, X, Star, Calendar, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

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
    { icon: CreditCard, label: 'Payment Methods', color: '#bd84f6', route: '/payment-methods' },
    { icon: Settings, label: 'Settings', color: '#f684a3', route: '/settings' },
    { icon: CircleHelp, label: 'Help & Support', color: '#9cdcb8', route: '/help-support' },
    { icon: Shield, label: 'Safety Center', color: '#84a7f6', route: '/safety-centre' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <Animated.View 
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('@/assets/images/SplashScreen.png')} // Replace with your actual logo path
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>


          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Pressable 
                  key={index} 
                  style={styles.menuItem}
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
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#ef4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </Pressable>
            
            <Text style={styles.version}>Version 1.0.1</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
  },
  menuContainer: {
    width: width * 0.8,
    maxWidth: 320,
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 32,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  letterBlock: {
    width: 20,
    height: 20,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
    opacity: 0.9,
  },
  letterText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoSubtext: {
    color: '#374151',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
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
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuItems: {
    flex: 1,
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    opacity: 0.9,
  },
  menuLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
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