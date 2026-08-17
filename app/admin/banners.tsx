import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import colors from '../../src/utils/colors';
import { 
  fetchBanners, 
  createBanner, 
  updateBanner, 
  deleteBanner, 
  uploadBannerImage 
} from '../../src/services/bannerService';
// BannersManager screen

export default function BannersManager() {
  const { add } = useLocalSearchParams();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form State
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [status, setStatus] = useState(true); // true = Active, false = Inactive
  const [showBanner, setShowBanner] = useState(true);

  const loadBannersList = async () => {
    setLoading(true);
    try {
      const data = await fetchBanners();
      setBanners(data);
    } catch (_error) {
      Alert.alert('Error', 'Failed to load banners list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBannersList();
  }, []);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please grant library access to select banner images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const openAddModal = () => {
    setEditingBannerId(null);
    setTitle('');
    setSubtitle('');
    setImageUri('');
    setButtonText('');
    setButtonLink('');
    setStatus(true);
    setShowBanner(true);
    setModalVisible(true);
  };

  useEffect(() => {
    if (add === 'true') {
      openAddModal();
    }
  }, [add]);

  const openEditModal = (banner) => {
    setEditingBannerId(banner.id);
    setTitle(banner.title || '');
    setSubtitle(banner.subtitle || '');
    setImageUri(banner.image_url || '');
    setButtonText(banner.button_text || '');
    setButtonLink(banner.button_link || '');
    setStatus(banner.status === 'Active');
    setShowBanner(banner.show_banner);
    setModalVisible(true);
  };

  const handleStatusToggle = async (banner) => {
    try {
      const newShow = !banner.show_banner;
      await updateBanner(banner.id, {
        ...banner,
        show_banner: newShow
      });
      // State updates dynamically via realtime or direct local update
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, show_banner: newShow } : b));
    } catch (_error) {
      Alert.alert('Error', 'Failed to toggle visibility status');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this banner permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBanner(id);
              setBanners(prev => prev.filter(b => b.id !== id));
            } catch (_error) {
              Alert.alert('Error', 'Failed to delete banner');
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Banner image is required.');
      return;
    }

    setSubmitLoading(true);
    try {
      // 1. Upload image if it is local URI
      let finalImageUrl = imageUri;
      if (imageUri.startsWith('file:') || imageUri.startsWith('content:')) {
        finalImageUrl = await uploadBannerImage(imageUri);
      }

      const payload = {
        image_url: finalImageUrl,
        title,
        subtitle,
        button_text: buttonText,
        button_link: buttonLink,
        status: status ? 'Active' : 'Inactive',
        show_banner: showBanner
      };

      if (editingBannerId) {
        await updateBanner(editingBannerId, payload);
        Alert.alert('Success', 'Banner updated successfully.');
      } else {
        await createBanner(payload);
        Alert.alert('Success', 'Banner added successfully.');
      }

      setModalVisible(false);
      loadBannersList();
    } catch (_error) {
      Alert.alert('Error', 'Failed to save banner.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderBannerItem = ({ item }) => (
    <View style={styles.bannerCard}>
      <Image source={{ uri: item.image_url }} style={styles.bannerCardImage} />
      <View style={styles.bannerCardContent}>
        {item.title ? <Text style={styles.bannerCardTitle}>{item.title}</Text> : null}
        {item.subtitle ? <Text style={styles.bannerCardSub}>{item.subtitle}</Text> : null}
        
        <View style={styles.bannerCardRow}>
          <Text style={[styles.statusTag, item.status === 'Active' ? styles.statusActive : styles.statusInactive]}>
            {item.status}
          </Text>
          <View style={styles.switchWrapper}>
            <Text style={styles.switchLabel}>Show on Store:</Text>
            <Switch
              value={item.show_banner}
              onValueChange={() => handleStatusToggle(item)}
              thumbColor={item.show_banner ? colors.primary : '#E5E7EB'}
              trackColor={{ true: '#A5D6A7', false: '#D1D5DB' }}
            />
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
            <MaterialCommunityIcons name="pencil" size={18} color="#2563EB" />
            <Text style={[styles.actionBtnText, { color: '#2563EB' }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
            <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#374151" />
        </View>
      ) : (
        <FlatList
          data={banners}
          keyExtractor={(item) => item.id}
          renderItem={renderBannerItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="image-off-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No banners added yet.</Text>
            </View>
          }
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Add Banner</Text>
      </TouchableOpacity>

      {/* Form Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingBannerId ? 'Edit Banner' : 'Add New Banner'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
              {/* Image Picker */}
              <TouchableOpacity style={styles.imageSelector} onPress={handlePickImage}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.imageSelectorPlaceholder}>
                    <MaterialCommunityIcons name="camera-plus-outline" size={32} color="#9CA3AF" />
                    <Text style={styles.imageSelectorText}>Select Banner Image</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Banner Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Special Discount!"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.inputLabel}>Banner Subtitle</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Get 20% off on all organic seeds."
                value={subtitle}
                onChangeText={setSubtitle}
              />

              <View style={styles.row}>
                <View style={[styles.col, { marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Button Text</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Shop Now"
                    value={buttonText}
                    onChangeText={setButtonText}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>Button Link / Route</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. /category?key=seeds"
                    value={buttonLink}
                    onChangeText={setButtonLink}
                  />
                </View>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabelBig}>Active Status (Publish):</Text>
                <Switch
                  value={status}
                  onValueChange={setStatus}
                  thumbColor={status ? colors.primary : '#E5E7EB'}
                  trackColor={{ true: '#A5D6A7', false: '#D1D5DB' }}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabelBig}>Show on App Feed:</Text>
                <Switch
                  value={showBanner}
                  onValueChange={setShowBanner}
                  thumbColor={showBanner ? colors.primary : '#E5E7EB'}
                  trackColor={{ true: '#A5D6A7', false: '#D1D5DB' }}
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={submitLoading}>
                {submitLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Banner</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  bannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bannerCardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  bannerCardContent: {
    padding: 16,
  },
  bannerCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  bannerCardSub: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  bannerCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusActive: {
    backgroundColor: '#E1F5FE',
    color: '#0288D1',
  },
  statusInactive: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    gap: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    gap: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  imageSelector: {
    width: '100%',
    height: 180,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageSelectorPlaceholder: {
    alignItems: 'center',
  },
  imageSelectorText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  col: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabelBig: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
