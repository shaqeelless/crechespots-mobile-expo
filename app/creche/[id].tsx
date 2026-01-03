// app/creche/[id].tsx
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
  BookOpen,
  Calendar,
  Gift,
  Image as ImageIcon,
  Home,
  Info,
  MessageSquare,
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

interface Article {
  id: string;
  title: string;
  content: string;
  type: 'Helpful' | 'Events' | 'Donation';
  author_id: string;
  latitude: number;
  longitude: number;
  hearts: number;
  creche_id: string;
  created_at: string;
  updated_at: string;
}

type TabType = 'overview' | 'gallery' | 'updates' | 'contact';

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
      </ScrollView>
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

// Gallery Tab Component
const GalleryTab = ({ images }: { images: GalleryImage[] }) => {
  if (images.length === 0) {
    return (
      <View style={styles.emptyState}>
        <ImageIcon size={48} color="#e5e7eb" />
        <Text style={styles.emptyStateTitle}>No Photos Yet</Text>
        <Text style={styles.emptyStateText}>
          This creche hasn't uploaded any photos yet.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabContent}>
      <View style={styles.galleryGrid}>
        {images.map((image, index) => (
          <View key={image.id} style={styles.galleryItem}>
            <Image
              source={{ uri: image.image_url }}
              style={styles.gridImage}
              resizeMode="cover"
            />
            {image.caption && (
              <Text style={styles.gridCaption} numberOfLines={1}>
                {image.caption}
              </Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Article Card Component for Updates Tab
const ArticleCard = ({ article }: { article: Article }) => {
  const router = useRouter();
  
  const getArticleIcon = () => {
    switch (article.type) {
      case 'Helpful':
        return <BookOpen size={20} color="#3b82f6" />;
      case 'Events':
        return <Calendar size={20} color="#10b981" />;
      case 'Donation':
        return <Gift size={20} color="#f59e0b" />;
      default:
        return <BookOpen size={20} color="#6b7280" />;
    }
  };

  const getArticleColor = () => {
    switch (article.type) {
      case 'Helpful':
        return '#3b82f6';
      case 'Events':
        return '#10b981';
      case 'Donation':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <Pressable 
      style={styles.articleCard}
      onPress={() => router.push(`/articles/${article.id}`)}
    >
      <View style={styles.articleHeader}>
        <View style={[styles.articleTypeBadge, { backgroundColor: getArticleColor() + '20' }]}>
          {getArticleIcon()}
          <Text style={[styles.articleTypeText, { color: getArticleColor() }]}>
            {article.type}
          </Text>
        </View>
        {article.hearts > 0 && (
          <View style={styles.articleHearts}>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <Text style={styles.articleHeartsText}>{article.hearts}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.articleTitle} numberOfLines={2}>
        {article.title}
      </Text>
      
      <Text style={styles.articleContent} numberOfLines={3}>
        {article.content}
      </Text>
      
      <Text style={styles.articleDate}>
        {new Date(article.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </Text>
    </Pressable>
  );
};

// Updates Tab Component
const UpdatesTab = ({ articles, onViewAll, onCreate }: { 
  articles: Article[]; 
  onViewAll: () => void;
  onCreate: () => void;
}) => {
  return (
    <ScrollView style={styles.tabContent}>
      {articles.length > 0 ? (
        <>
          <View style={styles.articlesContainer}>
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </View>
          
          {articles.length >= 5 && (
            <Pressable style={styles.viewAllButton} onPress={onViewAll}>
              <Text style={styles.viewAllButtonText}>View All Updates</Text>
              <ChevronRight size={16} color="#bd84f6" />
            </Pressable>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <MessageSquare size={48} color="#e5e7eb" />
          <Text style={styles.emptyStateTitle}>No Updates Yet</Text>
          <Text style={styles.emptyStateText}>
            This creche hasn't posted any updates yet.
          </Text>
          <Pressable style={styles.createFirstArticleButton} onPress={onCreate}>
            <Text style={styles.createFirstArticleButtonText}>Be the first to post</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
};

// Contact Tab Component
const ContactTab = ({ creche }: { creche: Creche }) => {
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

  return (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        {creche.phone_number && (
          <Pressable style={styles.contactRow} onPress={() => handleCall(creche.phone_number)}>
            <View style={styles.contactIcon}>
              <Phone size={20} color="#ffffff" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phone Number</Text>
              <Text style={styles.contactText}>{creche.phone_number}</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
        )}

        {creche.email && (
          <Pressable style={styles.contactRow} onPress={() => handleEmail(creche.email)}>
            <View style={[styles.contactIcon, { backgroundColor: '#ef4444' }]}>
              <Mail size={20} color="#ffffff" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email Address</Text>
              <Text style={styles.contactText}>{creche.email}</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
        )}

        {creche.website && (
          <Pressable style={styles.contactRow} onPress={() => handleWebsite(creche.website)}>
            <View style={[styles.contactIcon, { backgroundColor: '#3b82f6' }]}>
              <Globe size={20} color="#ffffff" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactText}>Visit Website</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
        )}

        {creche.whatsapp_number && (
          <Pressable style={styles.contactRow} onPress={() => handleWhatsApp(creche.whatsapp_number)}>
            <View style={[styles.contactIcon, { backgroundColor: '#25D366' }]}>
              <MessageCircle size={20} color="#ffffff" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactText}>Send Message</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </Pressable>
        )}
      </View>

      {/* Social Media */}
      {(creche.facebook_url || creche.instagram_url || creche.twitter_url) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialRow}>
            {creche.facebook_url && (
              <Pressable 
                style={[styles.socialButton, { backgroundColor: '#1877F2' }]} 
                onPress={() => handleWebsite(creche.facebook_url)}
              >
                <Facebook size={24} color="#ffffff" />
              </Pressable>
            )}
            {creche.instagram_url && (
              <Pressable 
                style={[styles.socialButton, { backgroundColor: '#E4405F' }]} 
                onPress={() => handleWebsite(creche.instagram_url)}
              >
                <Instagram size={24} color="#ffffff" />
              </Pressable>
            )}
            {creche.twitter_url && (
              <Pressable 
                style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]} 
                onPress={() => handleWebsite(creche.twitter_url)}
              >
                <Twitter size={24} color="#ffffff" />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Operating Hours */}
      {creche.operating_hours && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          <View style={styles.hoursCard}>
            <Clock size={24} color="#bd84f6" />
            <Text style={styles.hoursText}>{creche.operating_hours}</Text>
          </View>
        </View>
      )}

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.locationCard}>
          <MapPin size={24} color="#bd84f6" />
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              {creche.address || `${creche.suburb}, ${creche.province}`}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Tab Component
const TabButton = ({ 
  active, 
  icon: Icon, 
  label, 
  onPress 
}: { 
  active: boolean; 
  icon: any; 
  label: string; 
  onPress: () => void;
}) => (
  <Pressable 
    style={[styles.tabButton, active && styles.tabButtonActive]}
    onPress={onPress}
  >
    <Icon size={20} color={active ? '#ffffff' : '#9ca3af'} />
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
      {label}
    </Text>
  </Pressable>
);

export default function CrecheDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [creche, setCreche] = useState<Creche | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchCrecheDetails();
    fetchGalleryImages();
    fetchArticles();
    if (user) {
      checkIfFavorite();
    }
  }, [id, user]);

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
    }
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('creche_id', id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching articles:', error);
        return;
      }

      setArticles(data || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
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

  const viewAllArticles = () => {
    router.push(`/creche/${id}/articles`);
  };

  const createArticle = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    router.push(`/creche/${id}/articles/create`);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ScrollView style={styles.tabContent}>
            {/* Pricing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pricing</Text>
              <View style={styles.pricingCard}>
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
                <View style={styles.descriptionCard}>
                  <Text style={styles.description}>{creche.description}</Text>
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

            {/* Gallery Preview */}
            {galleryImages.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Photos ({galleryImages.length})</Text>
                  <Pressable onPress={() => setActiveTab('gallery')}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </Pressable>
                </View>
                <View style={styles.galleryPreview}>
                  {galleryImages.slice(0, 3).map((image) => (
                    <Image
                      key={image.id}
                      source={{ uri: image.image_url }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  ))}
                  {galleryImages.length > 3 && (
                    <View style={styles.moreImagesOverlay}>
                      <Text style={styles.moreImagesText}>+{galleryImages.length - 3}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Updates Preview */}
            {articles.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Updates</Text>
                  <Pressable onPress={() => setActiveTab('updates')}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </Pressable>
                </View>
                <View style={styles.updatesPreview}>
                  {articles.slice(0, 2).map((article) => (
                    <Pressable 
                      key={article.id} 
                      style={styles.updatePreviewCard}
                      onPress={() => router.push(`/articles/${article.id}`)}
                    >
                      <View style={[styles.updateTypeBadge, { backgroundColor: getArticleColor(article.type) + '20' }]}>
                        <Text style={[styles.updateTypeText, { color: getArticleColor(article.type) }]}>
                          {article.type}
                        </Text>
                      </View>
                      <Text style={styles.updateTitle} numberOfLines={2}>
                        {article.title}
                      </Text>
                      <Text style={styles.updateDate}>
                        {new Date(article.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        );
      case 'gallery':
        return <GalleryTab images={galleryImages} />;
      case 'updates':
        return <UpdatesTab 
          articles={articles} 
          onViewAll={viewAllArticles}
          onCreate={createArticle}
        />;
      case 'contact':
        return <ContactTab creche={creche} />;
      default:
        return null;
    }
  };

  const getArticleColor = (type: string) => {
    switch (type) {
      case 'Helpful':
        return '#3b82f6';
      case 'Events':
        return '#10b981';
      case 'Donation':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      {/* Gallery Header */}
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

      {/* Header Info */}
      <View style={styles.headerContent}>
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

      {/* Tabs Navigation */}
      <View style={styles.tabsContainer}>
        <TabButton
          active={activeTab === 'overview'}
          icon={Home}
          label="Overview"
          onPress={() => setActiveTab('overview')}
        />
        <TabButton
          active={activeTab === 'gallery'}
          icon={ImageIcon}
          label="Photos"
          onPress={() => setActiveTab('gallery')}
        />
        <TabButton
          active={activeTab === 'updates'}
          icon={MessageSquare}
          label="Updates"
          onPress={() => setActiveTab('updates')}
        />
        <TabButton
          active={activeTab === 'contact'}
          icon={Info}
          label="Contact"
          onPress={() => setActiveTab('contact')}
        />
      </View>

      {/* Tab Content */}
      {renderTabContent()}

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
          style={styles.applyButton} 
          onPress={handleApplyNow}
        >
          <Text style={styles.applyButtonText}>Apply Now</Text>
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
  // Header Styles
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
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
  headerContent: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
    marginLeft: 6,
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
  // Tabs Navigation
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#bd84f6',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  tabLabelActive: {
    color: '#bd84f6',
  },
  // Tab Content
  tabContent: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  viewAllText: {
    fontSize: 14,
    color: '#bd84f6',
    fontWeight: '600',
  },
  // Overview Tab
  pricingCard: {
    backgroundColor: '#f9f5ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#bd84f6',
    marginBottom: 8,
  },
  capacity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  descriptionCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  galleryPreview: {
    flexDirection: 'row',
    gap: 8,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
    height: 100,
    borderRadius: 8,
  },
  moreImagesOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '33%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  updatesPreview: {
    gap: 12,
  },
  updatePreviewCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  updateTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  updateTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  updateDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  // Gallery Tab
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  galleryItem: {
    width: '50%',
    padding: 8,
  },
  gridImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  gridCaption: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  // Updates Tab
  articlesContainer: {
    padding: 20,
    gap: 16,
  },
  articleCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  articleTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  articleTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  articleHearts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  articleHeartsText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
  articleContent: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  articleDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 20,
  },
  viewAllButtonText: {
    fontSize: 14,
    color: '#bd84f6',
    fontWeight: '600',
    marginRight: 4,
  },
  // Contact Tab
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#bd84f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  contactText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f5ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    gap: 12,
  },
  hoursText: {
    fontSize: 16,
    color: '#6b7280',
    flex: 1,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  // Empty States
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  createFirstArticleButton: {
    backgroundColor: '#bd84f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstArticleButtonText: {
    color: '#fff',
    fontWeight: '600',
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
    backgroundColor: '#bd84f6',
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
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Error States
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
});