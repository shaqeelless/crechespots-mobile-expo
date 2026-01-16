import React, { useRef, useEffect, useState } from 'react';
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
  Linking,
} from 'react-native';
import { User, Settings, CreditCard, CircleHelp, Shield, LogOut, X, Star, Calendar, MapPin, Facebook, Instagram, Linkedin, LogIn } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const { width, height } = Dimensions.get('window');

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
}

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_picture_url: string | null;
}

export default function SideMenu({ visible, onClose }: SideMenuProps) {
  const router = useRouter();
  const { session, user } = useAuth(); // Changed to use both session and user from useAuth
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (session?.user?.id) {
        fetchUserProfile();
      }
    }
  }, [visible, session]);

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

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userId = session?.user?.id || user?.id;
      
      if (!userId) {
        console.log('No user ID found');
        return;
      }

      console.log('Fetching profile for user ID:', userId);

      const { data, error } = await supabase
        .from('users')
        .select('id, email, display_name, first_name, last_name, profile_picture_url')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      console.log('User profile fetched:', data);
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuItemPress = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const openSocialMedia = (url: string) => {
    Linking.openURL(url).catch(err => 
      console.error('Failed to open URL:', err)
    );
  };

  const getInitials = () => {
    if (!userProfile) return 'U';
    
    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name.charAt(0)}${userProfile.last_name.charAt(0)}`.toUpperCase();
    }
    
    if (userProfile.display_name) {
      return userProfile.display_name.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  const handleLoginPress = () => {
    onClose();
    setTimeout(() => {
      router.push('/login');
    }, 300);
  };

  const menuItems = [
    { icon: MapPin, label: 'Saved Locations', color: '#f6cc84', route: '/favorites' },
    { icon: Settings, label: 'Settings', color: '#f684a3', route: '/settings' },
    { icon: CircleHelp, label: 'Help & Support', color: '#9cdcb8', route: '/help-support' },
    { icon: Shield, label: 'Safety Center', color: '#84a7f6', route: '/safety-centre' },
  ];

  const socialMediaLinks = [
    { 
      icon: Facebook, 
      label: 'Facebook',
      url: 'https://www.facebook.com/crechespots',
      color: '#1877F2'
    },
    { 
      icon: Instagram, 
      label: 'Instagram',
      url: 'https://www.instagram.com/crechespots',
      color: '#E4405F'
    },
    { 
      icon: Linkedin, 
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/company/crechespots',
      color: '#0A66C2'
    },
  ];

  // Check if user is logged in
  const isLoggedIn = !!(session || user);

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
            {/* Header with full-width logo */}
            <View style={styles.header}>
              <View style={styles.fullLogoContainer}>
                <Image 
                  source={require('@/assets/images/SplashScreen.png')}
                  style={styles.fullLogoImage}
                  resizeMode="contain"
                />
              </View>
            </View>



            {/* Main Content Area with centered menu items */}
            <View style={styles.mainContent}>
              <View style={styles.menuSection}>
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
              </View>
            </View>

            {/* Social Media Section */}
            <View style={styles.socialMediaSection}>
              <Text style={styles.socialMediaTitle}>Follow Us</Text>
              <View style={styles.socialIcons}>
                {socialMediaLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <Pressable
                      key={index}
                      style={({ pressed }) => [
                        styles.socialIconButton,
                        pressed && styles.socialIconPressed
                      ]}
                      onPress={() => openSocialMedia(social.url)}
                    >
                      <View style={[styles.socialIcon, { backgroundColor: social.color }]}>
                        <IconComponent size={20} color="#ffffff" />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
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
    width: '100%',
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullLogoContainer: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullLogoImage: {
    width: '100%',
    height: 60,
    maxWidth: 280,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  loginIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  loginTextContainer: {
    flex: 1,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#bd84f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
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
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },

  menuSectionTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuItems: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemPressed: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  socialMediaSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  socialMediaTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  socialIconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconPressed: {
    opacity: 0.7,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});