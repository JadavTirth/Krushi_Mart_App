import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '../../utils/colors';
import { useAuthStore } from '../../store/authStore';

export default function ProfileHeader({ user, onEditPress }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { logout } = useAuthStore();

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

          <TouchableOpacity 
            style={styles.smallStatBox} 
            onPress={() => router.push('/friends')}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>{user.friends || 0}</Text>
            <Text style={styles.statLabel}>{t('profile.yourFriends', 'Your Friends')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Identity Details */}
      <View style={styles.identityDetails}>
        <Text style={styles.nameLeft}>{user.name}</Text>

        <View style={styles.roleContainerLeft}>
          <MaterialCommunityIcons name="sprout" size={20} color={colors.primary} />
          <Text style={styles.role}>{user.role || t('profile.farmer', 'Farmer')}</Text>
        </View>

        {user.bio ? (
          <Text style={styles.bioTextAboveButton}>{user.bio}</Text>
        ) : null}

        <TouchableOpacity style={styles.editButtonSmall} onPress={onEditPress} activeOpacity={0.7}>

          <Text style={styles.editButtonTextSmall}>{t('profile.updateProfile', '✏ Update Your Profile')}</Text>
        </TouchableOpacity>

        {user?.is_admin ? (
          <TouchableOpacity 
            style={[styles.editButtonSmall, styles.adminButton]} 
            onPress={() => router.push('/admin')} 
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonTextSmall}>🔑 Open Admin Panel</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity 
          style={[styles.editButtonSmall, styles.logoutButton]} 
          onPress={logout} 
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>🚪 Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: 16, // 8pt
    paddingBottom: 16, // 8pt
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    borderBottomLeftRadius: 32, // 8pt
    borderBottomRightRadius: 32, // 8pt
  },
  topProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48, // 8pt
    marginBottom: 24, // 8pt
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
    marginLeft: 16, // 8pt
  },
  smallStatBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16, // 8pt
  },
  verticalDivider: {
    width: 1,
    height: 32, // 8pt
    backgroundColor: colors.divider,
    marginHorizontal: 8, // 8pt
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700', // Heading weight
    color: colors.text,
    marginBottom: 8, // 8pt
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '300', // Metadata weight
  },
  identityDetails: {
    alignItems: 'flex-start',
    marginBottom: 24, // 8pt
  },
  nameLeft: {
    fontSize: 22,
    fontWeight: '700', // Heading weight
    color: colors.text,
    marginBottom: 8, // 8pt
  },
  bioTextAboveButton: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  roleContainerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16, // 8pt
    paddingVertical: 8, // 8pt
    borderRadius: 24, // 8pt
    marginBottom: 16, // 8pt
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  role: {
    fontSize: 14,
    fontWeight: '600', // Section title weight (sub-role badge)
    color: colors.primary,
    marginLeft: 8, // 8pt
  },
  bioLeft: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24, // 8pt
  },
  editButtonSmall: {
    marginTop: 16, // 8pt
    backgroundColor: colors.primary,
    paddingVertical: 16, // 8pt tap target
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminButton: {
    backgroundColor: '#374151', // Dark slate gray for admin button
    marginTop: 12,
  },
  logoutButton: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginTop: 12,
  },
  logoutButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
  },
  editButtonTextSmall: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600', // Section title weight (semi-bold CTA text)
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16, // 8pt
    paddingHorizontal: 16, // 8pt
    marginHorizontal: -16, // 8pt pull
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600', // Section title weight
    color: colors.text,
    marginBottom: 16, // 8pt
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16, // 8pt
  },
  infoColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconSmall: {
    backgroundColor: '#F4F8EE',
    padding: 8, // 8pt
    borderRadius: 8, // 8pt
    marginRight: 8, // 8pt
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 8, // 8pt
    fontWeight: '300', // Metadata weight
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '400', // Body weight (contrast to light label)
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 16, // 8pt
  },
  cropsSectionInline: {
    marginTop: 16, // 8pt
    paddingTop: 16, // 8pt
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cropsTitleInline: {
    fontSize: 14,
    fontWeight: '600', // Section title weight
    color: colors.text,
    marginRight: 8, // 8pt
  },
  chipsContainerInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 8, // 8pt
  },
  cropChipInline: {
    backgroundColor: '#F4F8EE',
    paddingHorizontal: 16, // 8pt
    paddingVertical: 8, // 8pt
    borderRadius: 16,
  },
  cropTextInline: {
    fontSize: 14,
    fontWeight: '400', // Body weight
    color: colors.primary,
  },
});
