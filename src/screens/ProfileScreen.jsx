import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../utils/colors';
import ProfileHeader from '../components/profile/ProfileHeader';
import EditProfileModal from '../components/profile/EditProfileModal';
import PostCard from '../components/home/PostCard';
import CommentModal from '../components/home/CommentModal';
import ScreenContainer from '../components/common/ScreenContainer';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import useProfile from '../hooks/useProfile';
import { uploadProfileImage } from '../services/storageHelper';

const TAB_KEYS = [
  { id: 'myPosts', translationKey: 'profile.myPosts' },
  { id: 'savedPosts', translationKey: 'profile.savedPosts' }
];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('myPosts');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  const { 
    profile, 
    userPosts, 
    loadingProfile, 
    loadingPosts, 
    handleUpdateProfile 
  } = useProfile();

  React.useEffect(() => {
    if (tab && TAB_KEYS.find(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  // Format profile DB row into structure expected by ProfileHeader component
  const formattedUser = profile ? {
    name: profile.name,
    avatar: profile.avatar_url || 'https://i.pravatar.cc/150?img=11',
    location: [profile.village, profile.state].filter(Boolean).join(', ') || profile.district || 'Gujarat, India',
    totalPosts: userPosts.length,
    friends: 0,
    role: profile.farm_type ? `${profile.farm_type} Farmer` : 'Farmer',
    experience: profile.experience_years ? `${profile.experience_years} Years` : '',
    farmType: profile.farm_type || 'General Farming',
    bio: profile.bio || 'Helping farmers grow healthier crops 🌾',
    crops: profile.primary_crops || [],
    phone: profile.phone,
    email: profile.email,
  } : null;

  // Format profile for EditProfileModal
  const editProfileUser = profile ? {
    name: profile.name,
    phone: profile.phone,
    email: profile.email || '',
    avatar: profile.avatar_url || '',
    village: profile.village || '',
    district: profile.district || '',
    state: profile.state || '',
    farmSize: '',
    primaryCrops: Array.isArray(profile.primary_crops) ? profile.primary_crops.join(', ') : '',
    currentCrops: Array.isArray(profile.current_crops) ? profile.current_crops.join(', ') : '',
    medicinesUsed: Array.isArray(profile.medicines_used) ? profile.medicines_used.join(', ') : '',
    bio: profile.bio || '',
  } : null;

  const handleProfileSave = async (formData) => {
    try {
      let avatarUrl = profile.avatar_url;
      
      // If user selected a new local image
      if (formData.avatarUri && formData.avatarUri !== profile.avatar_url && !formData.avatarUri.startsWith('http')) {
        const uploadedUrl = await uploadProfileImage(profile.id, formData.avatarUri);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const dbData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        avatar_url: avatarUrl,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        bio: formData.bio,
        primary_crops: typeof formData.primaryCrops === 'string' 
          ? formData.primaryCrops.split(',').map(c => c.trim()).filter(Boolean)
          : formData.primaryCrops,
        current_crops: typeof formData.currentCrops === 'string'
          ? formData.currentCrops.split(',').map(c => c.trim()).filter(Boolean)
          : formData.currentCrops,
        medicines_used: typeof formData.medicinesUsed === 'string'
          ? formData.medicinesUsed.split(',').map(c => c.trim()).filter(Boolean)
          : formData.medicinesUsed,
      };
      await handleUpdateProfile(dbData);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {TAB_KEYS.map(tab => (
        <TouchableOpacity 
          key={tab.id} 
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
            {t(tab.translationKey)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHeader = () => (
    <View>
      {formattedUser && (
        <ProfileHeader user={formattedUser} onEditPress={() => setEditModalVisible(true)} />
      )}
      {renderTabs()}
    </View>
  );

  const renderEmptyState = () => {
    if (loadingPosts) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="image-multiple-outline" size={48} color={colors.textLight} />
        <Text style={styles.emptyText}>No posts to show</Text>
      </View>
    );
  };

  if (loadingProfile && !profile) {
    return (
      <ScreenContainer>
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  // Filter posts based on active tab
  const displayPosts = activeTab === 'myPosts' ? userPosts : [];

  return (
    <ScreenContainer>
      <FlatList
        data={displayPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard 
            post={item} 
            onCommentPress={() => {
              setSelectedPostForComment(item);
              setCommentModalVisible(true);
            }} 
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      
      <CommentModal 
        visible={commentModalVisible} 
        post={selectedPostForComment}
        onClose={() => {
          setCommentModalVisible(false);
          setSelectedPostForComment(null);
        }} 
      />

      {editProfileUser && (
        <EditProfileModal 
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          user={editProfileUser}
          onSave={handleProfileSave}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 80,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  fullScreenLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
