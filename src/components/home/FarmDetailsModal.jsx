import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import colors from '../../utils/colors';

export default function FarmDetailsModal({ visible, onClose, onSubmit }) {
  const [image, setImage] = useState(null);
  const [cropName, setCropName] = useState('');
  const [area, setArea] = useState('');
  const [soilType, setSoilType] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [description, setDescription] = useState('');

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to capture photos!');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need gallery permissions to select photos!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!cropName || !area) return;
    
    onSubmit({
      id: Date.now().toString(),
      image,
      cropName,
      area,
      soilType,
      waterSource,
      description,
    });

    setImage(null);
    setCropName('');
    setArea('');
    setSoilType('');
    setWaterSource('');
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Farm Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {image ? (
              <TouchableOpacity style={styles.imageUpload} onPress={() => setImage(null)} activeOpacity={0.8}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                <View style={styles.changeImageOverlay}>
                  <Text style={styles.changeImageText}>Tap to remove photo</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.photoActionRow}>
                <TouchableOpacity style={styles.photoActionBtn} onPress={pickImageFromCamera} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="camera" size={32} color={colors.primary} />
                  <Text style={styles.photoActionText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.photoActionBtn} onPress={pickImageFromGallery} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="image" size={32} color="#EF6C00" />
                  <Text style={styles.photoActionText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.label}>Crop Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Wheat, Cotton" 
              value={cropName} 
              onChangeText={setCropName} 
            />

            <Text style={styles.label}>Farm Area</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. 5 Acre" 
              value={area} 
              onChangeText={setArea} 
            />

            <Text style={styles.label}>Soil Type</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Black Soil" 
              value={soilType} 
              onChangeText={setSoilType} 
            />

            <Text style={styles.label}>Water Source</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Borewell, Canal" 
              value={waterSource} 
              onChangeText={setWaterSource} 
            />

            <Text style={styles.label}>Problem / Details</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="Describe crop health or issues..." 
              value={description} 
              onChangeText={setDescription} 
              multiline
              textAlignVertical="top"
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
              <Text style={styles.submitBtnText}>Submit Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  formContainer: {
    padding: 20,
  },
  photoActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  photoActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCard,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D2E8D4',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoActionText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 10,
  },
  imageUpload: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D2E8D4',
    borderStyle: 'dashed',
    marginBottom: 24,
    overflow: 'hidden',
  },
  changeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    alignItems: 'center',
  },
  changeImageText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    backgroundColor: colors.surface,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
