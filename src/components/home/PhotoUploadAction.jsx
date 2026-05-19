import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../utils/colors';
import PhotoPickerModal from '../common/PhotoPickerModal';

export default function PhotoUploadAction({ onPhotoSelected }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.uploadButton}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons
          name="camera"
          size={34}
          color={colors.primary}
          style={styles.icon}
        />
        <Text style={styles.buttonText}>Share your farming problem</Text>
      </TouchableOpacity>

      <PhotoPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onPhotoSelected={onPhotoSelected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    width: '100%',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: colors.surfaceCard,
    paddingVertical: 24,
    paddingHorizontal: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D2E8D4',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    width: '100%',
  },
  icon: {
    marginRight: 14,
    backgroundColor: colors.primary + '15',
    padding: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
