// app/search/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Linking,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Clock, 
  Users, 
  ChevronLeft,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Send
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface Creche {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  website: string;
  description: string;
  capacity: number;
  operating_hours: string;
  header_image: string;
  logo: string;
  monthly_price: number;
  weekly_price: number;
  price: number;
  province: string;
  suburb: string;
  registered: boolean;
  facilities: any;
  services: any;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  whatsapp_number: string;
}

export default function CrecheDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [creche, setCreche] = useState<Creche | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCrecheDetails();
  }, [id]);

  const fetchCrecheDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('creches')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      setCreche(data);
    } catch (err) {
      console.error('Error fetching creche details:', err);
      setError('Failed to load creche details');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url);
  };

  const handleWhatsApp = (number: string) => {
    Linking.openURL(`https://wa.me/${number}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${creche?.name} - ${creche?.description?.substring(0, 100)}...`,
        url: creche?.website || 'https://crechespots.co.za',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#bd4ab5" />
        <Text style={styles.loadingText}>Loading creche details...</Text>
      </View>
    );
  }

  if (error || !creche) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Error loading creche</Text>
        <Text style={styles.errorSubtext}>{error || 'Creche not found'}</Text>
        <Pressable style={styles.retryButton} onPress={fetchCrecheDetails}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <Image
        source={{ uri: creche.header_image || 'https://crechespots.org.za/wp-content/uploads/2024/08/Header_template.png' }}
        style={styles.headerImage}
        resizeMode="cover"
      />

      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={24} color="#000" />
      </Pressable>

      {/* Share Button */}
      <Pressable style={styles.shareButton} onPress={handleShare}>
        <Share2 size={20} color="#000" />
      </Pressable>

      <ScrollView style={styles.content}>
        {/* Basic Info */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{creche.name}</Text>
            {creche.registered && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          <View style={styles.locationRow}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.locationText}>
              {creche.address || `${creche.suburb}, ${creche.province}`}
            </Text>
          </View>

          <View style={styles.ratingRow}>
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.rating}>4.9</Text>
            <Text style={styles.reviews}>(156 reviews)</Text>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.pricingRow}>
            <Text style={styles.price}>
              {creche.monthly_price ? `R${creche.monthly_price}/month` : 
               creche.weekly_price ? `R${creche.weekly_price}/week` : 
               creche.price ? `R${creche.price}/day` : 'Contact for pricing'}
            </Text>
            {creche.capacity && (
              <View style={styles.capacity}>
                <Users size={14} color="#6b7280" />
                <Text style={styles.capacityText}>Capacity: {creche.capacity}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {creche.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{creche.description}</Text>
          </View>
        )}

        {/* Operating Hours */}
        {creche.operating_hours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Operating Hours</Text>
            <View style={styles.hoursRow}>
              <Clock size={16} color="#6b7280" />
              <Text style={styles.hoursText}>{creche.operating_hours}</Text>
            </View>
          </View>
        )}

        {/* Facilities */}
        {creche.facilities && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Facilities</Text>
            <View style={styles.tagsContainer}>
              {Object.entries(creche.facilities).map(([facility, available], index) => (
                available && (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>
                      {facility.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Text>
                  </View>
                )
              ))}
            </View>
          </View>
        )}

        {/* Services */}
        {creche.services && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.tagsContainer}>
              {Object.entries(creche.services).map(([service, available], index) => (
                available && (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>
                      {service.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Text>
                  </View>
                )
              ))}
            </View>
          </View>
        )}

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {creche.phone_number && (
            <Pressable style={styles.contactRow} onPress={() => handleCall(creche.phone_number)}>
              <Phone size={20} color="#bd4ab5" />
              <Text style={styles.contactText}>{creche.phone_number}</Text>
            </Pressable>
          )}

          {creche.email && (
            <Pressable style={styles.contactRow} onPress={() => handleEmail(creche.email)}>
              <Mail size={20} color="#bd4ab5" />
              <Text style={styles.contactText}>{creche.email}</Text>
            </Pressable>
          )}

          {creche.website && (
            <Pressable style={styles.contactRow} onPress={() => handleWebsite(creche.website)}>
              <Globe size={20} color="#bd4ab5" />
              <Text style={styles.contactText}>Visit Website</Text>
            </Pressable>
          )}

          {creche.whatsapp_number && (
            <Pressable style={styles.contactRow} onPress={() => handleWhatsApp(creche.whatsapp_number)}>
              <MessageCircle size={20} color="#25D366" />
              <Text style={styles.contactText}>WhatsApp</Text>
            </Pressable>
          )}
        </View>

        {/* Social Media */}
        {(creche.facebook_url || creche.instagram_url || creche.twitter_url) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Follow Us</Text>
            <View style={styles.socialRow}>
              {creche.facebook_url && (
                <Pressable style={styles.socialButton} onPress={() => handleWebsite(creche.facebook_url)}>
                  <Facebook size={20} color="#1877F2" />
                </Pressable>
              )}
              {creche.instagram_url && (
                <Pressable style={styles.socialButton} onPress={() => handleWebsite(creche.instagram_url)}>
                  <Instagram size={20} color="#E4405F" />
                </Pressable>
              )}
              {creche.twitter_url && (
                <Pressable style={styles.socialButton} onPress={() => handleWebsite(creche.twitter_url)}>
                  <Twitter size={20} color="#1DA1F2" />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Pressable style={styles.primaryButton} onPress={() => router.push(`/apply/${creche.id}`)}>
            <Text style={styles.primaryButtonText}>Apply Now</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Save to Favorites</Text>
          </Pressable>
          <Pressable style={styles.tertiaryButton}>
            <Text style={styles.tertiaryButtonText}>Schedule Visit</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerImage: {
    width: '100%',
    height: 250,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bd4ab5',
  },
  capacity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoursText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  contactText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSection: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#bd4ab5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bd4ab5',
  },
  tertiaryButtonText: {
    color: '#bd4ab5',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#bd4ab5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  backText: {
    color: '#374151',
    fontWeight: '600',
  },
});