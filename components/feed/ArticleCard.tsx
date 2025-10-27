import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Heart, MessageCircle, Share2, Clock, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    content: string;
    type: string;
    created_at: string;
    hearts: number;
    creche_id: string;
    author_id: string;
    creches?: {
      name: string;
      logo: string;
      suburb?: string;
      city?: string;
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
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike(article.id);
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
    return date.toLocaleDateString();
  };

  const authorName = article.creches?.name ||
    `${article.creches?.name || ''} ${article.users?.last_name || ''}`.trim() ||
    article.creches?.name ||
    'Anonymous';

  const authorImage = 
    article.creches?.logo ||
    'https://images.pexels.com/photos/8613073/pexels-photo-8613073.jpeg';

  return (
    <Pressable
      style={styles.articleCard}
      onPress={() => router.push(`/article/${article.id}`)}
    >
      <View style={styles.articleHeader}>
        <Image source={{ uri: authorImage }} style={styles.authorAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.authorName}>{authorName}</Text>
          {article.creches?.suburb && (
            <View style={styles.locationRow}>
              <MapPin size={12} color="#9ca3af" />
              <Text style={styles.location}>
                {article.creches.suburb}
                {article.creches?.city ? `, ${article.creches.city}` : ''}
              </Text>
            </View>
          )}
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
        <Pressable style={styles.engagementButton} onPress={handleLike}>
          <Heart
            size={18}
            color="#ef4444"
            fill={isLiked ? '#ef4444' : 'transparent'}
          />
          <Text style={styles.engagementText}>{likeCount}</Text>
        </Pressable>

        <Pressable style={styles.engagementButton} onPress={() => onComment(article.id)}>
          <MessageCircle size={18} color="#6b7280" />
          <Text style={styles.engagementText}>{article.comment_count || 0}</Text>
        </Pressable>

        <Pressable style={styles.engagementButton} onPress={() => onShare(article)}>
          <Share2 size={18} color="#6b7280" />
          <Text style={styles.engagementText}>Share</Text>
        </Pressable>
      </View>
    </Pressable>
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
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
  },
  headerInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
