import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../utils/colors';

export default function PublicProfileHeader({
  farmer,
  isOwnProfile,
  onEditPress,
  onFollowPress
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E8F5E9', '#F1F8E9', colors.background]}
        style={styles.heroBackground}
      />
      
      <View style={styles.contentContainer}>
        {/* Profile Image & ID Badge */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: farmer.avatar }} style={styles.avatar} />
          <View style={styles.idBadge}>
            <MaterialCommunityIcons name="shield-check" size={14} color="#FFF" style={styles.idIcon} />
            <Text style={styles.idText}>ID: {farmer.farmerId || 'K-001'}</Text>
          </View>
        </View>

        {/* Name & Location */}
        <View style={styles.nameSection}>
          <Text style={styles.name}>{farmer.name}</Text>
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.locationText}>{farmer.location}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{farmer.postsCount || 0}</Text>
            <Text style={styles.statLabel}>{t('profile.posts', 'Posts')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{farmer.friendsCount || 0}</Text>
            <Text style={styles.statLabel}>{t('profile.friends', 'Friends')}</Text>
          </View>
        </View>

        {/* Bio */}
        {farmer.bio && (
          <Text style={styles.bioText}>{farmer.bio}</Text>
        )}

        {/* Category Tags */}
        {farmer.categories && farmer.categories.length > 0 && (
          <View style={styles.tagsContainer}>
            {farmer.categories.map((cat, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{cat}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {isOwnProfile ? (
            <TouchableOpacity style={styles.editButton} onPress={onEditPress} activeOpacity={0.8}>
              <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
              <Text style={styles.editButtonText}>{t('profile.editProfile', 'Edit Profile')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionBtn, styles.followBtn]} onPress={onFollowPress} activeOpacity={0.8}>
              <MaterialCommunityIcons name="account-plus" size={20} color="#FFF" />
              <Text style={styles.followBtnText}>{t('profile.addFriend', 'Add Friend')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    overflow: 'hidden',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#FFF',
    backgroundColor: colors.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  idBadge: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  idIcon: {
    marginRight: 4,
  },
  idText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  nameSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
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
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.divider,
  },
  bioText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#F4F8EE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F8EE',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  followBtn: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  followBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
