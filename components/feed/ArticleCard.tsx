import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, Share2, Clock, MapPin, Building, ExternalLink } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    content: string;
    type: string;
    created_at: string;
    hearts: number;
    creche_id: string; // This is the field we need!
    author_id: string;
    creches?: {
      name: string;
      logo: string;
      suburb?: string;
      city?: string;
      province?: string;
    };
    users?: {
      first_name?: string;
      last_name?: string;
      display_name?: string;
      profile_picture_url?: string;
    };
    comment_count?: number;
    user_has_liked?: boolean;
  };
  onLike: (articleId: string) => void;
  onComment: (articleId: string) => void;
  onShare: (article: any) => void;
}

export default function ArticleCard({ article, onLike, onComment, onShare }: ArticleCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(article.user_has_liked || false);
  const [likeCount, setLikeCount] = useState(article.hearts || 0);

  const handleLike = () => {
    console.log('Like button pressed for article:', article.id);
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike(article.id);
  };

  const handleCrechePress = () => {
    console.log('Creche pressed!');
    console.log('Article creche_id:', article.creche_id);
    console.log('Creche data:', article.creches);
    
    if (article.creche_id) {
      console.log(`Navigating to /creche/${article.creche_id}`);
      router.push(`/creche/${article.creche_id}`);
    } else {
      console.warn('No creche_id found! Cannot navigate to creche page.');
      console.log('Full article object:', JSON.stringify(article, null, 2));
    }
  };

  const handleArticlePress = () => {
    console.log('Article pressed! Navigating to:', `/article/${article.id}`);
    router.push(`/article/${article.id}`);
  };

  const getCategoryColor = (type: string) => {
    const colors: Record<string, string> = {
      news: '#f68484',
      events: '#9cdcb8',
      tips: '#84a7f6',
      activities: '#f6cc84',
      announcements: '#2563eb',
      safety: '#f684a3',
      update: '#9cdcb8',
      article: '#84a7f6',
      helpful: '#3b82f6',
      donation: '#f59e0b',
    };
    return colors[type?.toLowerCase()] || '#2563eb';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const authorName = article.creches?.name ||
    `${article.users?.first_name || ''} ${article.users?.last_name || ''}`.trim() ||
    'Anonymous';

  const isCrecheArticle = !!article.creche_id && !!article.creches;
  const authorImage = isCrecheArticle
    ? (article.creches?.logo || 'https://crechespots.org.za/wp-content/uploads/2024/08/Header_template.png')
    : (article.users?.profile_picture_url || 'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg');

  console.log('ArticleCard rendering:', {
    articleId: article.id,
    articleTitle: article.title,
    isCrecheArticle,
    crecheId: article.creche_id,
    crecheName: article.creches?.name,
    authorName,
  });

  return (
    <TouchableOpacity 
      style={styles.articleCard}
      onPress={handleArticlePress}
      activeOpacity={0.95}
    >
      <View style={styles.articleHeader}>
        <View style={styles.authorContainer}>
          <TouchableOpacity 
            onPress={(e) => {
              console.log('Creche avatar pressed!');
              e.stopPropagation();
              if (isCrecheArticle) {
                handleCrechePress();
              }
            }}
            disabled={!isCrecheArticle}
            style={styles.crechePressable}
            activeOpacity={isCrecheArticle ? 0.7 : 1}
          >
            <Image source={{ uri: authorImage }} style={styles.authorAvatar} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <TouchableOpacity 
              onPress={(e) => {
                console.log('Creche name pressed!');
                e.stopPropagation();
                if (isCrecheArticle) {
                  handleCrechePress();
                }
              }}
              disabled={!isCrecheArticle}
              style={styles.crechePressable}
              activeOpacity={isCrecheArticle ? 0.7 : 1}
            >
              <View style={styles.nameRow}>
                <Text style={[
                  styles.authorName,
                  isCrecheArticle && styles.crecheName
                ]}>
                  {authorName}
                </Text>
              </View>
            </TouchableOpacity>
            
            
            {!isCrecheArticle && article.creches?.suburb && (
              <View style={styles.locationRow}>
                <MapPin size={12} color="#9ca3af" />
                <Text style={styles.location}>
                  {article.creches.suburb}
                  {article.creches?.province ? `, ${article.creches.province}` : ''}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.timeContainer}>
          <Clock size={12} color="#9ca3af" />
          <Text style={styles.timeAgo}>{formatTimeAgo(article.created_at)}</Text>
        </View>
      </View>

      {article.type && (
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(article.type) }]}>
          <Text style={styles.categoryText}>{article.type.toUpperCase()}</Text>
        </View>
      )}

      <Text style={styles.articleTitle}>{article.title}</Text>
      <Text style={styles.articleContent} numberOfLines={3}>
        {article.content}
      </Text>

      <View style={styles.engagementRow}>
        <TouchableOpacity 
          style={styles.engagementButton} 
          onPress={(e) => {
            console.log('Like button clicked');
            e.stopPropagation();
            handleLike();
          }}
          activeOpacity={0.7}
        >
          <Heart
            size={18}
            color="#ef4444"
            fill={isLiked ? '#ef4444' : 'transparent'}
          />
          <Text style={styles.engagementText}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.engagementButton} 
          onPress={(e) => {
            console.log('Comment button clicked');
            e.stopPropagation();
            onComment(article.id);
          }}
          activeOpacity={0.7}
        >
          <MessageCircle size={18} color="#6b7280" />
          <Text style={styles.engagementText}>{article.comment_count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.engagementButton} 
          onPress={(e) => {
            console.log('Share button clicked');
            e.stopPropagation();
            onShare(article);
          }}
          activeOpacity={0.7}
        >
          <Share2 size={18} color="#6b7280" />
          <Text style={styles.engagementText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  articleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  crechePressable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
  },
  avatarIndicator: {
    position: 'absolute',
    bottom: -2,
    right: 8,
    backgroundColor: '#bd84f6',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 6,
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  crecheName: {
    color: '#bd84f6',
    textDecorationLine: 'underline',
  },
  crecheIndicator: {
    marginLeft: 0,
  },
  linkIndicator: {
    marginLeft: 2,
  },
  crecheLinkContainer: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
    backgroundColor: '#f9f5ff',
  },
  crecheLinkText: {
    fontSize: 12,
    color: '#bd84f6',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: '#9ca3af',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
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
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  engagementText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});