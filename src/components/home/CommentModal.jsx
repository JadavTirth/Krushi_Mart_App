import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import colors from '../../utils/colors';
import CommentBox from './CommentBox';

export default function CommentModal({ visible, post, onClose }) {
  const { t } = useTranslation();
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backgroundDimmer} activeOpacity={1} onPress={onClose} />

        {/* 2/5 Photo Section */}
        <TouchableOpacity style={styles.photoContainer} activeOpacity={0.8} onPress={onClose}>
          {post?.image && (
            <Animated.View entering={FadeIn.duration(400)} style={styles.imageWrapper}>
              <Animated.Image
                source={{ uri: post.image }}
                style={styles.postImage}
                resizeMode="contain"
              />
              <View style={styles.tapToCloseBadge}>
                <MaterialCommunityIcons name="close-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.tapToCloseText}>Tap photo to close</Text>
              </View>
            </Animated.View>
          )}
        </TouchableOpacity>

        {/* 3/5 Comment Section */}
        <Animated.View
          entering={SlideInDown.duration(350)}
          style={styles.modalContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragIndicator} />
            <View style={styles.headerRow}>
              <Text style={styles.title}>💬 {t('comments.title')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
                <MaterialCommunityIcons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Comment Box UI */}
          <CommentBox post={post} />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backgroundDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    flex: 3, // 3/5 part of the screen
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  photoContainer: {
    flex: 2, 
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40, 
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  tapToCloseBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    bottom: 20,
  },
  tapToCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  header: {
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dragIndicator: {
    width: 50,
    height: 5,
    backgroundColor: '#CCCCCC',
    borderRadius: 3,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    backgroundColor: '#E57373', 
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },
});
