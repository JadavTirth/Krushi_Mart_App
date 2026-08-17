import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../src/services/categoryService';
import colors from '../../src/utils/colors';

const { width } = Dimensions.get('window');

// Common icons list for selecting in the form
const COMMON_ICONS = [
  'sprout', 'bug-outline', 'mushroom-outline', 'seed', 'shovel', 
  'tractor', 'water-pump', 'leaf', 'flower', 'tree', 'watering-can', 
  'fruit-grapes', 'corn', 'barley', 'nutrition'
];

// Presets colors list (Background hex, Icon hex)
const COLOR_PRESETS = [
  { bg: '#E8F5E9', icon: '#2E7D32' }, // Soft Green
  { bg: '#FFEBEE', icon: '#C62828' }, // Soft Red
  { bg: '#FFF3E0', icon: '#EF6C00' }, // Soft Orange
  { bg: '#F3E5F5', icon: '#6A1B9A' }, // Soft Purple
  { bg: '#EFEBE9', icon: '#4E342E' }, // Soft Brown
  { bg: '#E3F2FD', icon: '#1565C0' }, // Soft Blue
  { bg: '#E0F7FA', icon: '#006064' }, // Soft Cyan
  { bg: '#F1F8E9', icon: '#558B2F' }, // Soft Lime Green
  { bg: '#FFFDE7', icon: '#F57F17' }, // Soft Yellow
];

export default function CategoriesManager() {
  const { add } = useLocalSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form State
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(true); // true = Active, false = Inactive
  const [selectedIcon, setSelectedIcon] = useState('sprout');
  const [selectedColors, setSelectedColors] = useState({ bg: '#E8F5E9', icon: '#2E7D32' });

  const loadCategoriesList = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (_error) {
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoriesList();
  }, []);

  const openAddModal = () => {
    setEditingCategoryId(null);
    setName('');
    setDescription('');
    setStatus(true);
    setSelectedIcon('sprout');
    setSelectedColors({ bg: '#E8F5E9', icon: '#2E7D32' });
    setModalVisible(true);
  };

  useEffect(() => {
    if (add === 'true') {
      openAddModal();
    }
  }, [add]);

  const openEditModal = (category) => {
    setEditingCategoryId(category.id);
    setName(category.name || '');
    setDescription(category.description || '');
    setStatus(category.status === 'Active');
    setSelectedIcon(category.icon || 'sprout');
    setSelectedColors({
      bg: category.color || '#E8F5E9',
      icon: category.icon_color || '#2E7D32'
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this category permanently? Products associated with this category will become uncategorized.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(id);
              setCategories(prev => prev.filter(c => c.id !== id));
            } catch (_error) {
              Alert.alert('Error', 'Failed to delete category');
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Category name is required.');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        status: status ? 'Active' : 'Inactive',
        icon: selectedIcon,
        color: selectedColors.bg,
        icon_color: selectedColors.icon,
      };

      if (editingCategoryId) {
        await updateCategory(editingCategoryId, payload);
        Alert.alert('Success', 'Category updated successfully.');
      } else {
        await createCategory(payload);
        Alert.alert('Success', 'Category created successfully.');
      }

      setModalVisible(false);
      loadCategoriesList();
    } catch (_error) {
      Alert.alert('Error', 'Failed to save category.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.categoryCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, { backgroundColor: item.color || '#F3F4F6' }]}>
          <MaterialCommunityIcons 
            name={item.icon || 'folder'} 
            size={28} 
            color={item.icon_color || '#374151'} 
          />
        </View>
        <View style={styles.headerDetails}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={[styles.statusTag, item.status === 'Active' ? styles.statusActive : styles.statusInactive]}>
            {item.status}
          </Text>
        </View>
      </View>

      {item.description ? (
        <Text style={styles.categoryDesc} numberOfLines={2}>{item.description}</Text>
      ) : null}

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
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#374151" />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.listContent}
          numColumns={width > 600 ? 3 : 1}
          key={width > 600 ? 'multi-col' : 'single-col'}
          columnWrapperStyle={width > 600 ? styles.columnWrapper : undefined}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="shape-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No categories added yet.</Text>
            </View>
          }
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Add Category</Text>
      </TouchableOpacity>

      {/* Form Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingCategoryId ? 'Edit Category' : 'Create Category'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Category Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Fertilizer, Seeds, Pesticides"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Brief description of products inside this category."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              {/* Icon Selector Grid */}
              <Text style={styles.inputLabel}>Select Icon</Text>
              <View style={styles.iconSelectorGrid}>
                {COMMON_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconSelectorItem,
                      selectedIcon === icon && styles.iconSelectorSelected,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <MaterialCommunityIcons 
                      name={icon} 
                      size={24} 
                      color={selectedIcon === icon ? colors.primary : '#4B5563'} 
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Color Scheme Picker */}
              <Text style={styles.inputLabel}>Select Color Theme</Text>
              <View style={styles.colorPresetsGrid}>
                {COLOR_PRESETS.map((preset, index) => {
                  const isSelected = selectedColors.bg === preset.bg;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.colorPresetItem,
                        { backgroundColor: preset.bg },
                        isSelected && styles.colorPresetSelected
                      ]}
                      onPress={() => setSelectedColors(preset)}
                    >
                      <MaterialCommunityIcons name="check" size={16} color={preset.icon} style={{ opacity: isSelected ? 1 : 0 }} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Live Preview badge */}
              <Text style={styles.inputLabel}>Live Preview</Text>
              <View style={styles.previewContainer}>
                <View style={[styles.previewIconCircle, { backgroundColor: selectedColors.bg }]}>
                  <MaterialCommunityIcons name={selectedIcon} size={28} color={selectedColors.icon} />
                </View>
                <Text style={styles.previewName}>{name || 'Category Name'}</Text>
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

              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={submitLoading}>
                {submitLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Category</Text>
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
  columnWrapper: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 11,
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
  categoryDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  iconSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  iconSelectorItem: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSelectorSelected: {
    borderColor: colors.primary,
    backgroundColor: '#E8F5E9',
  },
  colorPresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  colorPresetItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorPresetSelected: {
    borderColor: '#374151',
    transform: [{ scale: 1.1 }],
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  previewIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
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
