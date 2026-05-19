import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import colors from '../../utils/colors';

export default function ProfileHeader({ user, onEditPress }) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Premium Hero Background */}
      <LinearGradient
        colors={['#E8F5E9', '#F1F8E9', colors.background]}
        style={styles.heroBackground}
      />

      {/* Top Profile Image & Stats Row */}
      <View style={styles.topProfileRow}>
        <Image source={{ uri: user.avatar }} style={styles.avatarLeft} />

        <View style={styles.statsRightContainer}>
          <View style={styles.smallStatBox}>
            <Text style={styles.statNumber}>{user.totalPosts || 0}</Text>
            <Text style={styles.statLabel}>{t('profile.yourPosts', 'Your Posts')}</Text>
          </View>
          
          <View style={styles.verticalDivider} />

          <View style={styles.smallStatBox}>
            <Text style={styles.statNumber}>{user.friends || 24}</Text>
            <Text style={styles.statLabel}>{t('profile.yourFriends', 'Your Friends')}</Text>
          </View>
        </View>
      </View>

      {/* Identity Details */}
      <View style={styles.identityDetails}>
        <Text style={styles.nameLeft}>{user.name}</Text>
        <Text style={styles.smallBioLeft}>{t('profile.defaultBio', 'Helping farmers grow healthier crops 🌾')}</Text>

        <View style={styles.roleContainerLeft}>
          <MaterialCommunityIcons name="sprout" size={20} color={colors.primary} />
          <Text style={styles.role}>{user.role || t('profile.farmer')}</Text>
        </View>
        <Text style={styles.bioLeft}>{user.bio}</Text>

        <TouchableOpacity style={styles.editButtonSmall} onPress={onEditPress} activeOpacity={0.7}>
          <Text style={styles.editButtonTextSmall}>{t('profile.updateProfile', '✏ Update Your Profile')}</Text>
        </TouchableOpacity>
      </View>

      {/* Farm Details Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>{t('profile.farmDetails', 'Farm Details')}</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.primary} style={styles.infoIconSmall} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{t('profile.location', 'Location')}</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{user.location}</Text>
            </View>
          </View>

          <View style={styles.infoColumn}>
            <MaterialCommunityIcons name="leaf" size={20} color={colors.primary} style={styles.infoIconSmall} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{t('profile.farmingType', 'Farming Type')}</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{user.farmType}</Text>
            </View>
          </View>
        </View>

        {/* Main Crops Inline Integration */}
        {user.crops && user.crops.length > 0 && (
          <View style={styles.cropsSectionInline}>
            <Text style={styles.cropsTitleInline}>{t('profile.cropsLabel', 'Crops:')}</Text>
            <View style={styles.chipsContainerInline}>
              {user.crops.map((crop, index) => (
                <View key={index} style={styles.cropChipInline}>
                  <Text style={styles.cropTextInline}>🌾 {crop}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    marginBottom: 20,
  },
  avatarLeft: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: colors.divider,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statsRightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginLeft: 16,
  },
  smallStatBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.divider,
    marginHorizontal: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  identityDetails: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  nameLeft: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  smallBioLeft: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  roleContainerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  role: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  bioLeft: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  editButtonSmall: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonTextSmall: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: -16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  infoColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconSmall: {
    backgroundColor: '#F4F8EE',
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 18,
  },
  cropsSectionInline: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cropsTitleInline: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginRight: 8,
  },
  chipsContainerInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 12,
  },
  cropChipInline: {
    backgroundColor: '#F4F8EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cropTextInline: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
