import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import colors from '../../utils/colors';
import CustomButton from '../common/CustomButton';

export default function MedicineModal({ visible, medicine, onClose }) {
  const { t } = useTranslation();
  if (!medicine) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade" // Fade background, animate content manually
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          entering={FadeIn.duration(300)}
          style={styles.modalContent}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.name}>{medicine.name}</Text>
              <Text style={styles.disease}>{medicine.disease}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{medicine.price}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{medicine.quantity}</Text>
              </View>
            </View>

            <View style={styles.reviewsRow}>
              <MaterialCommunityIcons name="star" size={20} color={colors.accent} />
              <Text style={styles.reviewsText}>{medicine.reviews}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicine.fullDescription')}</Text>
              <Text style={styles.sectionText}>{medicine.description}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicine.howToUse')}</Text>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="water-outline" size={22} color={colors.primary} />
                <Text style={styles.infoText}>{medicine.howToUse}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('medicine.safetyWarnings')}</Text>
              <View style={styles.warningBox}>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="alert" size={22} color={colors.warning} />
                  <Text style={[styles.infoText, { color: colors.warning, fontWeight: '700' }]}>{medicine.warning}</Text>
                </View>
                <Text style={styles.safetyText}>{medicine.safety}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <CustomButton title={t('medicine.buyNow')} onPress={onClose} style={styles.buyButton} />
          </View>
        </Animated.View>
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
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  disease: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: colors.surfaceCard,
    padding: 8,
    borderRadius: 20,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  badge: {
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  reviewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  reviewsText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  warningBox: {
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  safetyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#F57F17',
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  buyButton: {
    width: '100%',
  },
});
