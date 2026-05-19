import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../utils/colors';

export default function PhotoPickerModal({ visible, onClose, onPhotoSelected, isNested }) {
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to capture photos!');
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need gallery permissions to select photos!');
      return false;
    }
    return true;
  };

  const handleCamera = async () => {
    onClose();
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        if (onPhotoSelected) onPhotoSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error launching camera:', error);
      Alert.alert('Error', 'Could not open camera. Are you running on an emulator without a camera?');
    }
  };

  const handleGallery = async () => {
    onClose();
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        if (onPhotoSelected) onPhotoSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error launching gallery:', error);
      Alert.alert('Error', 'Could not open gallery.');
    }
  };

  const content = (
    <Pressable style={styles.modalOverlay} onPress={onClose}>
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />
        <Text style={styles.sheetTitle}>Choose Photo Source</Text>

        <TouchableOpacity style={styles.sheetOption} onPress={handleCamera}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <MaterialCommunityIcons name="camera-outline" size={26} color={colors.primary} />
          </View>
          <Text style={styles.optionText}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sheetOption} onPress={handleGallery}>
          <View style={[styles.iconContainer, { backgroundColor: colors.accent + '25' }]}>
            <MaterialCommunityIcons name="image-outline" size={26} color={colors.warning || colors.accent} />
          </View>
          <Text style={styles.optionText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  if (!visible) return null;

  if (isNested) {
    return (
      <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}>
        {content}
      </View>
    );
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: colors.divider,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});
