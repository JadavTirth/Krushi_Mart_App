import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View, Share } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import colors from '../../utils/colors';

export default function PostCard({ post, onLike, onComment, onCommentPress, onShare }) {
  const { t } = useTranslation();
  const handleComment = onCommentPress || onComment;

  const liked = post.liked;
  const [isSaved, setIsSaved] = useState(false);
  const scale = useSharedValue(1);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  const handleLikePress = () => {
    scale.value = withSequence(
      withSpring(1.5, { damping: 2, stiffness: 150 }),
      withSpring(1, { damping: 2, stiffness: 150 })
    );
    if (onLike) onLike(post.id);
  };

  const handleSharePress = async () => {
    try {
      const result = await Share.share({
        message: `${post.user.name} shared an update on Krushi Mart:\n\n"${post.text}"\n\nJoin the community today!`,
      });
      if (result.action === Share.sharedAction) {
        if (onShare) onShare(post.id);
      }
    } catch (error) {
      console.error('Error sharing post:', error.message);
    }
  };

  const handleSavePress = () => {
    setIsSaved(!isSaved);
  };

  // Pinch and Pan to Zoom Logic
  const imageScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      imageScale.value = e.scale;
    })
    .onEnd(() => {
      imageScale.value = withTiming(1, { duration: 250 });
      translateX.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(0, { duration: 250 });
    });

  const panGesture = Gesture.Pan()
    .minPointers(2) // Allow 1-finger touches to scroll the feed normally!
    .onUpdate((e) => {
      // Only allow panning if the image is zoomed in
      if (imageScale.value > 1) {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      imageScale.value = withTiming(1, { duration: 250 });
      translateX.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(0, { duration: 250 });
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedImageZoomStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: Math.max(1, imageScale.value) }
      ],
    };
  });

  return (
    <View style={styles.card}>
      {/* 1. Header Section */}
      <View style={styles.header}>
        <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
        <View style={styles.headerTextContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{post.user.name}</Text>
            {post.user.isVerified && (
              <MaterialCommunityIcons name="check-decagram" size={16} color={colors.primary} style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={styles.metaText}>
            {post.location ? `${post.location} • ` : ''}{post.time}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton} activeOpacity={0.6} onPress={handleSharePress}>
          <MaterialCommunityIcons name="share-variant" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* 2. Post Content Section */}
      <View style={styles.content}>
        {/* Optional Tag */}
        {post.cropTag && (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{post.cropTag}</Text>
          </View>
        )}

        {/* Caption */}
        <Text style={styles.caption} numberOfLines={5}>
          {post.text}
        </Text>
      </View>

      {/* 3. Post Image Section (Full Width) */}
      {post.image && (
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.imageContainer, { overflow: 'hidden' }]}>
            <Animated.Image 
              source={{ uri: post.image }} 
              style={[styles.postImage, animatedImageZoomStyle]} 
              resizeMode="cover" 
            />
            {post.images && post.images.length > 1 && (
              <View style={styles.multipleImageBadge}>
                <MaterialCommunityIcons name="image-multiple" size={14} color="#FFF" />
                <Text style={styles.multipleImageText}>1/{post.images.length}</Text>
              </View>
            )}
          </Animated.View>
        </GestureDetector>
      )}

      {/* 4. Engagement Stats Section */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {post.likes} {t('post.likes')} • {post.comments} {t('post.comments')} {post.shares !== undefined ? `• ${post.shares} ${t('post.shares')}` : ''}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* 5. Action Buttons Section */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLikePress} activeOpacity={0.7}>
          <Animated.View style={animatedIconStyle}>
            <MaterialCommunityIcons
              name={liked ? "thumb-up" : "thumb-up-outline"}
              size={24}
              color={liked ? colors.primary : colors.textSecondary}
            />
          </Animated.View>
          <Text style={[styles.actionLabel, liked && styles.actionLabelActive]}>{t('post.like')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleComment} activeOpacity={0.7}>
          <MaterialCommunityIcons name="comment-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.actionLabel}>{t('post.comment')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSavePress} activeOpacity={0.7}>
          <MaterialCommunityIcons 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isSaved ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.actionLabel, isSaved && styles.actionLabelActive]}>
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.divider,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 4,
  },
  verifiedIcon: {
    marginTop: 2,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    opacity: 0.8,
  },
  moreButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    paddingHorizontal: 16,
  },
  tagContainer: {
    backgroundColor: colors.surfaceCard,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  tagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  caption: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    maxWidth: '96%',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: colors.divider,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  multipleImageBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  multipleImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  statsText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  actionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  actionLabelActive: {
    color: colors.primary,
  },
});
