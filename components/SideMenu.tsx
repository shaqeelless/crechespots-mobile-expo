import React from 'react';
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

const { width } = Dimensions.get('window');

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function SideMenu({ visible, onClose }: SideMenuProps) {
  const menuItems = [
    { icon: User, label: 'Profile', color: '#f68484' },
    { icon: Calendar, label: 'My Bookings', color: '#9cdcb8' },
    { icon: Star, label: 'My Reviews', color: '#84a7f6' },
    { icon: MapPin, label: 'Saved Locations', color: '#f6cc84' },
    { icon: CreditCard, label: 'Payment Methods', color: '#bd84f6' },
    { icon: Settings, label: 'Settings', color: '#f684a3' },
    { icon: CircleHelp, label: 'Help & Support', color: '#9cdcb8' },
    { icon: Shield, label: 'Safety Center', color: '#84a7f6' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.menuContainer}>
          {/* Header */}
          <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/SplashScreen.png')} // Replace with your actual logo path
              style={styles.logoImage}
              resizeMode="contain"
              />
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#374151" />
            </Pressable>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JS</Text>
            </View>
            <View>
              <Text style={styles.userName}>John Smith</Text>
              <Text style={styles.userEmail}>john.smith@email.com</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Pressable key={index} style={styles.menuItem}>
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
            <Pressable style={styles.logoutButton}>
              <LogOut size={20} color="#ef4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </Pressable>
            
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>
        </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    marginBottom: 4,
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
    width: 200, // Adjust based on your logo dimensions
    height: 60, // Adjust based on your logo dimensions
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
    backgroundColor: '#bd4ab5',
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