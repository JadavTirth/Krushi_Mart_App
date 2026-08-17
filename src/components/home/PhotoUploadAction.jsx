import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../utils/colors';
import PhotoPickerModal from '../common/PhotoPickerModal';

export default function PhotoUploadAction({ onPhotoSelected }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setModalVisible(true)}
        style={styles.cardWrapper}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Top content row */}
          <View style={styles.contentRow}>
            <View style={styles.textColumn}>
              <Text style={styles.titleText}>Share your farming problem</Text>
              <Text style={styles.subtitleText}>
                Upload a photo to ask agricultural experts & other farmers for instant solutions.
              </Text>
            </View>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="camera" size={28} color={colors.primary} />
            </View>
          </View>

          {/* Action Button inside card */}
          <View style={styles.actionBtn}>
            <MaterialCommunityIcons name="plus" size={16} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnText}>Ask Question</Text>
          </View>
        </LinearGradient>
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
    paddingHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
    width: '100%',
  },
  cardWrapper: {
    width: '100%',
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  gradientCard: {
    padding: 20,
    borderRadius: 20,
    justifyContent: 'space-between',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  textColumn: {
    flex: 1,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 16,
    elevation: 2,
  },
  actionBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
