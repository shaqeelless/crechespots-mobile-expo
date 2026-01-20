// app/search/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Dimensions,
  FlatList,
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
  Send,
  Heart,
  ChevronRight,
  ChevronLeft as LeftIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

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

interface GalleryImage {
  id: string;
  creche_id: string;
  image_url: string;
  caption: string;
  order_index: number;
  created_at: string;
}

interface CrecheClass {
  id: string;
  creche_id: string;
  name: string;
  color: string;
  capacity: number;
  min_age_months: number;
  max_age_months: number;
  current_enrollment?: number;
  has_capacity?: boolean;
}

// Skeleton Loading Component
const SkeletonLoader = () => {
  return (
    <View style={styles.container}>
      {/* Gallery Skeleton */}
      <View style={styles.skeletonGallery}>
        <View style={styles.skeletonGalleryImage} />
        <View style={styles.skeletonGalleryDots}>
          <View style={styles.skeletonGalleryDot} />
          <View style={styles.skeletonGalleryDot} />
          <View style={styles.skeletonGalleryDot} />
        </View>
      </View>
      
      {/* Back Button Skeleton */}
      <View style={styles.skeletonBackButton} />
      
      {/* Share Button Skeleton */}
      <View style={styles.skeletonShareButton} />

      <ScrollView style={styles.content}>
        {/* Basic Info Skeleton */}
        <View style={styles.section}>
          <View style={styles.skeletonTitleRow}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonVerifiedBadge} />
          </View>
          <View style={styles.skeletonLocationRow} />
          <View style={styles.skeletonRatingRow} />
        </View>

        {/* Capacity Status Skeleton */}
        <View style={styles.section}>
          <View style={styles.skeletonCapacityStatus} />
          <View style={styles.skeletonCapacityInfo} />
        </View>

        {/* Pricing Skeleton */}
        <View style={styles.section}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonPricingRow}>
            <View style={styles.skeletonPrice} />
            <View style={styles.skeletonCapacity} />
          </View>
        </View>

        {/* Description Skeleton */}
        <View style={styles.section}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonDescription}>
            <View style={styles.skeletonDescriptionLine} />
            <View style={styles.skeletonDescriptionLine} />
            <View style={styles.skeletonDescriptionLineShort} />
          </View>
        </View>

        {/* Classes Skeleton */}
        <View style={styles.section}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonClassesContainer}>
            <View style={styles.skeletonClassCard} />
            <View style={styles.skeletonClassCard} />
          </View>
        </View>

        {/* Operating Hours Skeleton */}
        <View style={styles.section}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonHoursRow} />
        </View>

        {/* Facilities Skeleton */}
        <View style={styles.section}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonTagsContainer}>
            <View style={styles.skeletonTag} />
            <View style={styles.skeletonTag} />
            <View style={styles.skeletonTag} />
            <View style={styles.skeletonTag} />
          </View>
        </View>

        {/* Services Skeleton */}
        <View style={styles.section}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonTagsContainer}>
            <View style={styles.skeletonTag} />
            <View style={styles.skeletonTag} />
            <View style={styles.skeletonTag} />
          </View>
        </View>

        {/* Contact Information Skeleton */}
        <View style={styles.section}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonContactRows}>
            <View style={styles.skeletonContactRow} />
            <View style={styles.skeletonContactRow} />
            <View style={styles.skeletonContactRow} />
          </View>
        </View>

        {/* Social Media Skeleton */}
        <View style={styles.section}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonSocialRow}>
            <View style={styles.skeletonSocialButton} />
            <View style={styles.skeletonSocialButton} />
            <View style={styles.skeletonSocialButton} />
          </View>
        </View>
      </ScrollView>

      {/* Floating Buttons Skeleton */}
      <View style={styles.floatingButtonsSkeleton}>
        <View style={styles.skeletonFloatingButton} />
        <View style={styles.skeletonFloatingButton} />
      </View>
    </View>
  );
};

// Gallery Component
const GalleryView = ({ images }: { images: GalleryImage[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
    }
  };

  if (images.length === 0) {
    return (
      <View style={styles.galleryContainer}>
        <Image
          source={{ uri: 'https://crechespots.org.za/wp-content/uploads/2024/08/Header_template.png' }}
          style={styles.galleryImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={styles.galleryContainer}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gallerySlide}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.galleryImage}
              resizeMode="cover"
            />
            {item.caption && (
              <View style={styles.imageCaption}>
                <Text style={styles.captionText}>{item.caption}</Text>
              </View>
            )}
          </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          {currentIndex > 0 && (
            <Pressable style={[styles.navArrow, styles.leftArrow]} onPress={goToPrevious}>
              <LeftIcon size={24} color="#fff" />
            </Pressable>
          )}
          {currentIndex < images.length - 1 && (
            <Pressable style={[styles.navArrow, styles.rightArrow]} onPress={goToNext}>
              <ChevronRight size={24} color="#fff" />
            </Pressable>
          )}
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default function CrecheDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [creche, setCreche] = useState<Creche | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [crecheClasses, setCrecheClasses] = useState<CrecheClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchCrecheDetails();
    fetchGalleryImages();
    if (user) {
      checkIfFavorite();
    }
  }, [id, user]);

  // Animate header when scrolling
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      const opacity = Math.min(value / 100, 1);
      headerOpacity.setValue(opacity);
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, []);

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
      
      // Fetch creche classes after loading creche details
      await fetchCrecheClasses(data.id);
    } catch (err) {
      console.error('Error fetching creche details:', err);
      setError('Failed to load creche details');
    }
  };

  const fetchCrecheClasses = async (crecheId: string) => {
    try {
      // Fetch creche classes
      const { data: classesData, error: classesError } = await supabase
        .from('creche_classes')
        .select('*')
        .eq('creche_id', crecheId)
        .order('min_age_months', { ascending: true });

      if (classesError) throw classesError;

      if (classesData && classesData.length > 0) {
        // Get current enrollment for each class
        const classesWithEnrollment = await Promise.all(
          classesData.map(async (classItem) => {
            const { count } = await supabase
              .from('students')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', classItem.id)
              .eq('status', 'active');

            return {
              ...classItem,
              current_enrollment: count || 0,
              has_capacity: (count || 0) < classItem.capacity
            };
          })
        );

        setCrecheClasses(classesWithEnrollment);
      } else {
        setCrecheClasses([]);
      }
    } catch (error) {
      console.error('Error fetching creche classes:', error);
      setCrecheClasses([]);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('creche_gallery')
        .select('*')
        .eq('creche_id', id)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching gallery images:', error);
        return;
      }

      setGalleryImages(data || []);
    } catch (err) {
      console.error('Error fetching gallery images:', err);
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

  const checkIfFavorite = async () => {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user?.id)
        .eq('creche_id', id)
        .maybeSingle();

      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('creche_id', id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            creche_id: id,
          });

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleApplyNow = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    router.push(`/apply/${creche?.id}`);
  };

  // Function to check if creche has available classes
  const hasAvailableClasses = () => {
    return crecheClasses.some(classItem => classItem.has_capacity);
  };

  // Function to get capacity status
  const getCapacityStatus = () => {
    if (crecheClasses.length === 0) {
      return {
        hasClasses: false,
        hasCapacity: false,
        text: 'No classes defined',
        color: '#6b7280',
        icon: AlertCircle,
        availableSpots: 0,
        totalCapacity: 0,
        totalEnrollment: 0
      };
    }

    const availableClasses = crecheClasses.filter(c => c.has_capacity);
    const totalCapacity = crecheClasses.reduce((sum, c) => sum + c.capacity, 0);
    const totalEnrollment = crecheClasses.reduce((sum, c) => sum + (c.current_enrollment || 0), 0);
    const availableSpots = totalCapacity - totalEnrollment;
    const capacityPercentage = totalCapacity > 0 ? (totalEnrollment / totalCapacity) * 100 : 0;

    if (availableClasses.length > 0) {
      if (capacityPercentage >= 90) {
        return {
          hasClasses: true,
          hasCapacity: true,
          text: 'Limited Spots Available',
          color: '#f59e0b',
          icon: AlertCircle,
          availableSpots,
          totalCapacity,
          totalEnrollment
        };
      } else if (capacityPercentage >= 75) {
        return {
          hasClasses: true,
          hasCapacity: true,
          text: 'Some Spots Available',
          color: '#f59e0b',
          icon: AlertCircle,
          availableSpots,
          totalCapacity,
          totalEnrollment
        };
      } else {
        return {
          hasClasses: true,
          hasCapacity: true,
          text: 'Spots Available',
          color: '#22c55e',
          icon: CheckCircle,
          availableSpots,
          totalCapacity,
          totalEnrollment
        };
      }
    } else {
      return {
        hasClasses: true,
        hasCapacity: false,
        text: 'Join Waitlist',
        color: '#ef4444',
        icon: XCircle,
        availableSpots: 0,
        totalCapacity,
        totalEnrollment
      };
    }
  };

  // Function to get button text based on capacity
  const getApplyButtonText = () => {
    const status = getCapacityStatus();
    
    if (!status.hasClasses) {
      return 'Contact Creche';
    } else if (status.hasCapacity) {
      return 'Apply Now';
    } else {
      return 'Join Waitlist';
    }
  };

  // Function to get button color based on capacity
  const getApplyButtonStyle = () => {
    const status = getCapacityStatus();
    
    if (!status.hasClasses) {
      return styles.contactButton;
    } else if (status.hasCapacity) {
      return styles.applyNowButton;
    } else {
      return styles.waitlistButton;
    }
  };

  const renderClassCard = (classItem: CrecheClass, index: number) => {
    const capacityPercentage = classItem.current_enrollment 
      ? (classItem.current_enrollment / classItem.capacity) * 100 
      : 0;
    
    const getCapacityColor = (percentage: number, hasCapacity: boolean) => {
      if (!hasCapacity) return '#ef4444';
      if (percentage >= 90) return '#f59e0b';
      if (percentage >= 75) return '#f59e0b';
      return '#10b981';
    };

    return (
      <View key={classItem.id} style={styles.classCard}>
        <View style={styles.classHeader}>
          <View style={[styles.classColor, { backgroundColor: classItem.color }]} />
          <Text style={styles.className}>{classItem.name}</Text>
          <View style={[
            styles.classStatus,
            { backgroundColor: classItem.has_capacity ? '#10b98115' : '#ef444415' }
          ]}>
            {classItem.has_capacity ? (
              <>
                <CheckCircle size={12} color="#10b981" />
                <Text style={[styles.classStatusText, { color: '#10b981' }]}>
                  Available
                </Text>
              </>
            ) : (
              <>
                <XCircle size={12} color="#ef4444" />
                <Text style={[styles.classStatusText, { color: '#ef4444' }]}>
                  Full
                </Text>
              </>
            )}
          </View>
        </View>
        
        <View style={styles.classDetails}>
          <View style={styles.classDetailRow}>
            <Clock size={12} color="#6b7280" />
            <Text style={styles.classDetailText}>
              Age: {classItem.min_age_months} - {classItem.max_age_months} months
            </Text>
          </View>
          
          <View style={styles.classDetailRow}>
            <Users size={12} color="#6b7280" />
            <Text style={styles.classDetailText}>
              Spots: {classItem.current_enrollment || 0}/{classItem.capacity}
            </Text>
          </View>
        </View>

        <View style={styles.capacityContainer}>
          <View style={styles.capacityBar}>
            <View 
              style={[
                styles.capacityFill,
                { 
                  width: `${Math.min(capacityPercentage, 100)}%`,
                  backgroundColor: getCapacityColor(capacityPercentage, classItem.has_capacity || false)
                }
              ]} 
            />
          </View>
          <Text style={[
            styles.capacityText,
            { color: getCapacityColor(capacityPercentage, classItem.has_capacity || false) }
          ]}>
            {classItem.has_capacity 
              ? (capacityPercentage >= 90 ? 'Limited' : 
                 capacityPercentage >= 75 ? 'Limited Spots' : 
                 'Available')
              : 'Full'}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return <SkeletonLoader />;
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

  const capacityStatus = getCapacityStatus();

  return (
    <View style={styles.container}>
      {/* Gallery */}
      <GalleryView images={galleryImages} />

      {/* Animated Header Background */}
      <Animated.View 
        style={[
          styles.animatedHeader,
          {
            opacity: headerOpacity,
          }
        ]}
      />

      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={24} color="#000" />
      </Pressable>

      {/* Share Button */}
      <Pressable style={styles.shareButton} onPress={handleShare}>
        <Share2 size={20} color="#000" />
      </Pressable>

      <Animated.ScrollView 
        style={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
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

        {/* Capacity Status */}
        {crecheClasses.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.capacityStatusContainer, { backgroundColor: `${capacityStatus.color}15` }]}>
              <View style={styles.capacityStatusHeader}>
                <View style={[styles.capacityStatusIcon, { backgroundColor: capacityStatus.color }]}>
                  {React.createElement(capacityStatus.icon, { size: 16, color: '#ffffff' })}
                </View>
                <Text style={[styles.capacityStatusTitle, { color: capacityStatus.color }]}>
                  {capacityStatus.text}
                </Text>
              </View>
              

            </View>
          </View>
        )}

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.pricingRow}>
            <Text style={styles.price}>
              {creche.monthly_price ? `R${creche.monthly_price}/month` : 
               creche.weekly_price ? `R${creche.weekly_price}/week` : 
               creche.price ? `R${creche.price}/day` : 'Contact for pricing'}
            </Text>

          </View>
        </View>

        {/* Description */}
        {creche.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{creche.description}</Text>
          </View>
        )}



        {/* Gallery Info */}
        {galleryImages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gallery ({galleryImages.length})</Text>
            <Text style={styles.gallerySubtitle}>
              View {galleryImages.length} photo{galleryImages.length !== 1 ? 's' : ''} of this creche
            </Text>
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
              <Phone size={20} color="#bd84f6" />
              <Text style={styles.contactText}>{creche.phone_number}</Text>
            </Pressable>
          )}

          {creche.email && (
            <Pressable style={styles.contactRow} onPress={() => handleEmail(creche.email)}>
              <Mail size={20} color="#bd84f6" />
              <Text style={styles.contactText}>{creche.email}</Text>
            </Pressable>
          )}

          {creche.website && (
            <Pressable style={styles.contactRow} onPress={() => handleWebsite(creche.website)}>
              <Globe size={20} color="#bd84f6" />
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

        {/* Spacer for floating buttons */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.floatingButtons}>
        <Pressable 
          style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
          onPress={toggleFavorite}
          disabled={favoriteLoading}
        >
          {favoriteLoading ? (
            <ActivityIndicator size="small" color={isFavorite ? "#ffffff" : "#374151"} />
          ) : (
            <Heart
              size={20}
              color={isFavorite ? '#ffffff' : '#374151'}
              fill={isFavorite ? '#ffffff' : 'transparent'}
            />
          )}
          <Text style={[styles.favoriteButtonText, isFavorite && styles.favoriteButtonTextActive]}>
            {isFavorite ? 'Saved' : 'Save'}
          </Text>
        </Pressable>

        <Pressable 
          style={[styles.applyButton, getApplyButtonStyle()]} 
          onPress={handleApplyNow}
        >
          <Text style={styles.applyButtonText}>{getApplyButtonText()}</Text>
          <Send size={16} color="#ffffff" />
        </Pressable>
      </View>
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
  // Gallery Styles
  galleryContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  gallerySlide: {
    width: width,
    height: 300,
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  imageCaption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
  },
  captionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 12,
  },
  gallerySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
    zIndex: 10,
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
    zIndex: 10,
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  // Capacity Status Styles
  capacityStatusContainer: {
    borderRadius: 12,
    padding: 16,
  },
  capacityStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  capacityStatusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  capacityStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  capacityStats: {
    gap: 8,
  },
  capacityStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityStatLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  capacityStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  availableSpots: {
    color: '#22c55e',
  },
  noSpots: {
    color: '#ef4444',
  },
  capacityProgress: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  capacityProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bd84f6',
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
  // Classes Styles
  classesContainer: {
    gap: 12,
  },
  classCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  classColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  classStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  classStatusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  classDetails: {
    marginBottom: 12,
  },
  classDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  classDetailText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
  },
  capacityContainer: {
    marginTop: 8,
  },
  capacityBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  capacityFill: {
    height: '100%',
    borderRadius: 3,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
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
  bottomSpacer: {
    height: 100, // Space for floating buttons
  },
  // Floating Buttons
  floatingButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  favoriteButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  favoriteButtonActive: {
    backgroundColor: '#bd84f6',
    borderColor: '#bd84f6',
  },
  favoriteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  favoriteButtonTextActive: {
    color: '#ffffff',
  },
  applyButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  applyNowButton: {
    backgroundColor: '#bd84f6',
  },
  waitlistButton: {
    backgroundColor: '#f59e0b',
  },
  contactButton: {
    backgroundColor: '#6b7280',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
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
    backgroundColor: '#bd84f6',
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
  // Skeleton Loading Styles
  skeletonGallery: {
    width: '100%',
    height: 300,
    backgroundColor: '#e5e7eb',
    position: 'relative',
  },
  skeletonGalleryImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#d1d5db',
  },
  skeletonGalleryDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  skeletonGalleryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
  },
  skeletonBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  skeletonShareButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  skeletonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  skeletonTitle: {
    flex: 1,
    height: 28,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginRight: 8,
  },
  skeletonVerifiedBadge: {
    width: 60,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  skeletonLocationRow: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  skeletonRatingRow: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '40%',
  },
  skeletonCapacityStatus: {
    height: 60,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 8,
  },
  skeletonCapacityInfo: {
    height: 40,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  skeletonSectionTitle: {
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 12,
    width: '30%',
  },
  skeletonPricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonPrice: {
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '40%',
  },
  skeletonCapacity: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '30%',
  },
  skeletonDescription: {
    gap: 8,
  },
  skeletonDescriptionLine: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '100%',
  },
  skeletonDescriptionLineShort: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '60%',
  },
  skeletonClassesContainer: {
    gap: 12,
  },
  skeletonClassCard: {
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  skeletonHoursRow: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '50%',
  },
  skeletonTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skeletonTag: {
    width: 80,
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  skeletonContactRows: {
    gap: 12,
  },
  skeletonContactRow: {
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: '70%',
  },
  skeletonSocialRow: {
    flexDirection: 'row',
    gap: 16,
  },
  skeletonSocialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
  },
  floatingButtonsSkeleton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  skeletonFloatingButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
});