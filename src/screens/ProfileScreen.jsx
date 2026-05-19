import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import colors from '../utils/colors';
import ProfileHeader from '../components/profile/ProfileHeader';
import EditProfileModal from '../components/profile/EditProfileModal';
import PostCard from '../components/home/PostCard';
import CommentModal from '../components/home/CommentModal';
import { MOCK_USER, MOCK_POSTS } from '../constants/data';
import ScreenContainer from '../components/common/ScreenContainer';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';

const TAB_KEYS = [
  { id: 'myPosts', translationKey: 'profile.myPosts' },
  { id: 'savedPosts', translationKey: 'profile.savedPosts' }
];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('myPosts');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(MOCK_USER);

  React.useEffect(() => {
    if (tab && TAB_KEYS.find(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  // Filter posts based on active tab for demonstration
  // In a real app, this would fetch from an API
  const displayPosts = activeTab === 'myPosts' 
    ? [MOCK_POSTS[0]] // Just showing one post as user's post
    : [MOCK_POSTS[2]]; // Showing one as saved

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
      <ProfileHeader user={userProfile} onEditPress={() => setEditModalVisible(true)} />
      {renderTabs()}
    </View>
  );

  return (
    <ScreenContainer>
      <FlatList
        data={displayPosts}
        keyExtractor={(item, index) => item.id + index.toString()}
        renderItem={({ item }) => (
          <PostCard 
            post={item} 
            onCommentPress={() => setCommentModalVisible(true)} 
          />
        )}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      
      <CommentModal 
        visible={commentModalVisible} 
        onClose={() => setCommentModalVisible(false)} 
      />

      <EditProfileModal 
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        user={userProfile}
        onSave={(newData) => setUserProfile({ ...userProfile, ...newData })}
      />
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
});
