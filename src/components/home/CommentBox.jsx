import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../utils/colors';
import { useAuthStore } from '../../store/authStore';
import useComments from '../../hooks/useComments';

const CommentItem = ({ comment, isReply = false }) => {
  const { t } = useTranslation();
  const [liked, setLiked] = useState(false);

  return (
    <View style={[styles.commentWrapper, isReply && styles.replyWrapper]}>
      <Image source={{ uri: comment.user.avatar }} style={isReply ? styles.replyAvatar : styles.avatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <View style={styles.commentHeader}>
            <Text style={styles.userName}>{comment.user.name}</Text>
            <Text style={styles.timeText}>{comment.time}</Text>
          </View>
          <Text style={styles.commentText}>{comment.text}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.actionBtn}>
            <Text style={[styles.actionText, liked && styles.actionTextActive]}>
              👍 {t('post.like')} {comment.likes > 0 && `(${liked ? comment.likes + 1 : comment.likes})`}
            </Text>
          </TouchableOpacity>
          <Text style={styles.dotSeparator}>•</Text>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>↩ {t('comments.reply')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function CommentBox({ post }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuthStore();
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { comments, loading, handleAddComment } = useComments(post?.id);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    setIsSending(true);
    try {
      await handleAddComment(inputText.trim());
      setInputText('');
    } catch (error) {
      console.error('Failed to add comment in CommentBox:', error);
    } finally {
      setIsSending(false);
    }
  };

  const renderHeader = () => {
    if (!post) return null;
    return (
      <View style={styles.postPreviewContainer}>
        <View style={styles.postPreviewHeader}>
          <Image source={{ uri: post.user.avatar }} style={styles.postPreviewAvatar} />
          <View>
            <Text style={styles.postPreviewName}>{post.user.name}</Text>
            <Text style={styles.postPreviewTime}>{post.time}</Text>
          </View>
        </View>
        <Text style={styles.postPreviewText} numberOfLines={2}>{post.text}</Text>
        <View style={styles.previewDivider} />
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="comment-text-outline" size={48} color={colors.divider} />
        <Text style={styles.emptyText}>{t('comments.noCommentsYet')}</Text>
        <Text style={styles.emptySubText}>{t('comments.beFirstToShare')}</Text>
      </View>
    );
  };

  const currentAvatar = currentUser?.avatar_url || 'https://i.pravatar.cc/150?img=11';

  return (
    <View style={styles.container}>
      {/* 2. Comments List UI */}
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View>
            <CommentItem comment={item} />
            {item.replies && item.replies.length > 0 && (
              <View style={styles.repliesContainer}>
                {item.replies.map(reply => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </View>
            )}
          </View>
        )}
      />

      {/* 1. Bottom Input Section */}
      <View style={[styles.inputSection, { paddingBottom: Math.max(insets.bottom + 10, 16) }]}>
        <Image source={{ uri: currentAvatar }} style={styles.inputAvatar} />
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder={t('comments.writeComment')}
            placeholderTextColor={colors.textLight}
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isSending}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
            disabled={!inputText.trim() || isSending}
            onPress={handleSend}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons 
                name="send" 
                size={20} 
                color={inputText.trim() ? '#FFFFFF' : colors.textLight} 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  // Input Section Styles
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    zIndex: 10,
  },
  inputAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingLeft: 16,
    paddingRight: 6,
    minHeight: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: colors.text,
    maxHeight: 120,
    paddingVertical: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.divider,
  },
  
  // List Styles
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  
  // Comment Item Styles
  commentWrapper: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  replyWrapper: {
    marginBottom: 14,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#F4F8EE',
    padding: 14,
    borderRadius: 18,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  commentText: {
    fontSize: 18,
    color: colors.text,
    lineHeight: 26,
  },
  
  // Action Row (Like, Reply)
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  actionBtn: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  actionTextActive: {
    color: colors.primary,
  },
  dotSeparator: {
    fontSize: 12,
    color: colors.textLight,
    marginHorizontal: 8,
  },
  
  // Replies Container
  repliesContainer: {
    marginLeft: 48, // Indentation for replies
    marginTop: 4,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
  },
  // Post Preview
  postPreviewContainer: {
    marginBottom: 20,
    backgroundColor: colors.surfaceCard,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  postPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postPreviewAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  postPreviewName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  postPreviewTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  postPreviewText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  previewDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginTop: 16,
    marginHorizontal: -16,
  },
});
