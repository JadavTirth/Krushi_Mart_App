import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Share } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import colors from '../../utils/colors';
import ImageZoomModal from '../common/ImageZoomModal';

export default function PostCard({ post, onLike, onComment, onCommentPress, onShare, onSave }) {
  const handleComment = onCommentPress || onComment;

  const liked = post.liked;
  const isSaved = post.isSaved;
  const scale = useSharedValue(1);
  const [isZoomVisible, setIsZoomVisible] = useState(false);

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
    if (onSave) onSave(post.id);
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
  const tapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd((_event, success) => {
      if (success) {
        runOnJS(setIsZoomVisible)(true);
      }
    });

  const composedGesture = Gesture.Exclusive(
    Gesture.Simultaneous(pinchGesture, panGesture),
    tapGesture
  );

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

        {/* Title */}
        {post.title && (
          <Text style={styles.postTitle}>{post.title}</Text>
        )}

        {/* Caption */}
        <Text style={styles.caption} numberOfLines={5}>
          {post.text}
        </Text>
      </View>

      {/* 3. Post Image Section (Full Width) */}
      {post.image && (
        <>
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

          <ImageZoomModal
            visible={isZoomVisible}
            imageUrl={post.image}
            onClose={() => setIsZoomVisible(false)}
          />
        </>
      )}

      {/* Action Buttons Section */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLikePress} activeOpacity={0.7}>
          <Animated.View style={animatedIconStyle}>
            <MaterialCommunityIcons
              name={liked ? "thumb-up" : "thumb-up-outline"}
              size={24}
              color={liked ? colors.primary : colors.textSecondary}
            />
          </Animated.View>
          <Text style={styles.actionCount}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleComment} activeOpacity={0.7}>
          <MaterialCommunityIcons name="comment-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.actionCount}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSavePress} activeOpacity={0.7}>
          <MaterialCommunityIcons 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isSaved ? colors.primary : colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 16, // 8pt floating card
    marginTop: 16, // 8pt floating separation
    borderRadius: 16, // Beautiful rounded corners
    paddingTop: 16, // 8pt
    paddingBottom: 16, // 8pt
    // Minimal depth shadows (no hard border lines)
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden', // Clips child image corners to match card radius!
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16, // 8pt
    marginBottom: 8, // 8pt
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.divider,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16, // 8pt
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600', // Section title weight
    color: colors.text,
    marginRight: 8, // 8pt
  },
  verifiedIcon: {
    marginTop: 0,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '300', // Metadata weight
    color: colors.textSecondary,
    marginTop: 4, // 8pt micro-spacing
    opacity: 0.8,
  },
  moreButton: {
    padding: 8, // 8pt
    marginRight: -8, // 8pt
  },
  content: {
    paddingHorizontal: 16, // 8pt
  },
  tagContainer: {
    backgroundColor: colors.surfaceCard,
    alignSelf: 'flex-start',
    paddingHorizontal: 8, // 8pt
    paddingVertical: 4, // micro
    borderRadius: 16,
    marginBottom: 8, // 8pt
  },
  tagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '400', // Body weight
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700', // Heading weight
    color: colors.primaryDark,
    marginBottom: 8, // 8pt
  },
  caption: {
    fontSize: 15,
    fontWeight: '400', // Body weight
    color: colors.text,
    lineHeight: 24, // 8pt line height
    maxWidth: '96%',
    marginBottom: 8, // 8pt
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3, // widescreen aspect ratio
    backgroundColor: colors.divider,
    marginBottom: 8, // 8pt
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  multipleImageBadge: {
    position: 'absolute',
    top: 16, // 8pt
    right: 16, // 8pt
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16, // 8pt
    paddingVertical: 8, // 8pt
    borderRadius: 20,
    gap: 8, // 8pt
  },
  multipleImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400', // Body weight
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Equal spacing between column actions
    alignItems: 'center',
    paddingHorizontal: 16, // 8pt
    paddingTop: 8, // 8pt
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8, // 8pt tap target height
    flex: 1,
  },
  actionCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '300', // Metadata weight
    marginTop: 4, // 8pt micro-spacing
  },
});
