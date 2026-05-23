import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import colors from '../../utils/colors';
import { useAuthStore } from '../../store/authStore';
import PhotoPickerModal from '../common/PhotoPickerModal';

export default function CreatePostModal({ visible, onClose, initialPhoto, onSubmit }) {
  const { t } = useTranslation();
  const { user: currentUser } = useAuthStore();
  const [postText, setPostText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(initialPhoto || null);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (visible) {
      if (initialPhoto) setSelectedPhoto(initialPhoto);
    } else {
      setPostText('');
      setSelectedCategory(null);
      setSelectedPhoto(null);
      setIsSubmitting(false);
    }
  }, [visible, initialPhoto]);

  const categories = [
    { id: 'crop', key: 'post.catCropIssue', icon: '🌾', label: 'Crop Issue' },
    { id: 'pest', key: 'post.catPestProblem', icon: '🐛', label: 'Pest Problem' },
    { id: 'tip', key: 'post.catFarmingTip', icon: '💡', label: 'Farming Tip' },
    { id: 'weather', key: 'post.catWeather', icon: '🌧', label: 'Weather' },
    { id: 'market', key: 'post.catMarketUpdate', icon: '📍', label: 'Market Update' },
  ];

  const handlePost = async () => {
    if (!postText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const activeCategory = categories.find(c => c.id === selectedCategory);
      const categoryDbValue = activeCategory ? activeCategory.id : 'crop';
      const cropTag = activeCategory ? t(activeCategory.key) : 'Farming';

      if (onSubmit) {
        await onSubmit(postText.trim(), selectedPhoto, categoryDbValue, cropTag);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting post in CreatePostModal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAvatar = currentUser?.avatar_url || 'https://i.pravatar.cc/150?img=11';
  const currentName = currentUser?.name || 'Demo Farmer';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton} activeOpacity={0.7} disabled={isSubmitting}>
            <MaterialCommunityIcons name="close" size={32} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('post.createPost')}</Text>
          <View style={{ width: 32 }} />
        </View>

        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.userInfo}>
              <Image source={{ uri: currentAvatar }} style={styles.avatar} />
              <View>
                <Text style={styles.userName}>{currentName}</Text>
                <View style={styles.privacyPill}>
                  <MaterialCommunityIcons name="earth" size={16} color={colors.textSecondary} />
                  <Text style={styles.privacyText}>{t('post.public')}</Text>
                </View>
              </View>
            </View>

            {selectedPhoto ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedPhoto }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageBtn} 
                  onPress={() => setSelectedPhoto(null)}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                >
                  <MaterialCommunityIcons name="close-circle" size={36} color={colors.surface} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.uploadArea} 
                activeOpacity={0.8} 
                onPress={() => setPhotoPickerVisible(true)}
                disabled={isSubmitting}
              >
                <MaterialCommunityIcons name="camera-plus" size={48} color={colors.primary} />
                <Text style={styles.uploadTitle}>{t('post.uploadPhoto')}</Text>
                <Text style={styles.uploadHelper}>{t('post.uploadHelper')}</Text>
              </TouchableOpacity>
            )}

            <View style={styles.inputSection}>
              <TextInput
                style={styles.textInput}
                placeholder={t('post.describeProblem')}
                placeholderTextColor={colors.textLight}
                multiline
                value={postText}
                onChangeText={setPostText}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
              <Text style={styles.inputHelper}>{t('post.exampleHelper')}</Text>
            </View>

            <View style={styles.categorySection}>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, isActive && styles.activeCategoryChip]}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.7}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                    <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
                      {t(cat.key)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

          </ScrollView>

          <View style={styles.bottomToolbar}>
            <TouchableOpacity style={styles.draftButton} activeOpacity={0.7} onPress={onClose} disabled={isSubmitting}>
              <Text style={styles.draftButtonText}>{t('post.saveDraft')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.postButton, (!postText.trim() || isSubmitting) && styles.postButtonDisabled]}
              disabled={!postText.trim() || isSubmitting}
              onPress={handlePost}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.postButtonText}>{t('post.postNow')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Reusable Photo Picker */}
      <PhotoPickerModal
        visible={photoPickerVisible}
        onClose={() => setPhotoPickerVisible(false)}
        onPhotoSelected={(uri) => setSelectedPhoto(uri)}
        isNested={true}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    zIndex: 10,
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  // User Section
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    alignSelf: 'flex-start',
    gap: 6,
  },
  privacyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  uploadArea: {
    backgroundColor: '#F4F8EE',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.surfaceCard,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  uploadHelper: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Text Input Area
  inputSection: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    fontSize: 20,
    color: colors.text,
    minHeight: 160,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputHelper: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    paddingHorizontal: 4,
    fontStyle: 'italic',
  },
  // Category Chips
  categorySection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
  },
  activeCategoryChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  // Bottom Toolbar
  bottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: colors.surface,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  draftButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: colors.surfaceCard,
    marginRight: 12,
  },
  draftButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  postButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  postButtonDisabled: {
    backgroundColor: colors.divider,
    elevation: 0,
    shadowOpacity: 0,
  },
  postButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
