import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PostCard from '../../src/components/home/PostCard';
import PublicProfileHeader from '../../src/components/profile/PublicProfileHeader';
import colors from '../../src/utils/colors';

// Simulated API Calls
const fetchFarmerProfile = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        farmerId: `K-${id.substring(0, 4).toUpperCase()}`,
        name: 'Ramesh Kumar',
        location: 'Pune, Maharashtra',
        avatar: 'https://images.unsplash.com/photo-1595859702816-793dbedbc62b?auto=format&fit=crop&q=80&w=200',
        bio: 'Passionate organic farmer with 10+ years of experience. Believes in sustainable agriculture and helping fellow farmers.',
        categories: ['Organic', 'Wheat', 'Dairy'],
        postsCount: 12,
        friendsCount: 145,
      });
    }, 1000);
  });
};

const fetchFarmerPosts = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'p1',
          user: {
            name: 'Ramesh Kumar',
            avatar: 'https://images.unsplash.com/photo-1595859702816-793dbedbc62b?auto=format&fit=crop&q=80&w=200',
            isVerified: true,
          },
          location: 'Pune, Maharashtra',
          time: '2 hours ago',
          cropTag: 'Wheat Harvesting',
          text: 'Started the wheat harvest today! The yield looks promising this season despite the early rains. Taking care of moisture levels.',
          image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
          likes: 245,
          comments: 42,
          shares: 12,
        },
        {
          id: 'p2',
          user: {
            name: 'Ramesh Kumar',
            avatar: 'https://images.unsplash.com/photo-1595859702816-793dbedbc62b?auto=format&fit=crop&q=80&w=200',
            isVerified: true,
          },
          location: 'Pune, Maharashtra',
          time: '2 days ago',
          cropTag: 'Organic Fertilizer',
          text: 'Prepared a fresh batch of Jeevamrutha for the cotton fields. Natural farming is the way to go for long-term soil health. 🌱',
          likes: 189,
          comments: 24,
          shares: 8,
        }
      ]);
    }, 1200);
  });
};

export default function FarmerProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  const isWeb = Platform.OS === 'web';
  // If the viewport is wide enough (web/tablet), we constrain the content width
  const contentWidth = isWeb && width > 768 ? 600 : '100%';

  const loadData = async () => {
    try {
      const [profileData, postsData] = await Promise.all([
        fetchFarmerProfile(id || 'default'),
        fetchFarmerPosts(id || 'default')
      ]);
      setProfile(profileData);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [id]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const renderTopBar = () => (
    <View style={[styles.topBar, { paddingTop: insets.top || 16 }]}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.topBarTitle} numberOfLines={1}>
        {profile ? profile.name : t('profile.loading', 'Loading...')}
      </Text>
      <TouchableOpacity style={styles.moreButton}>
        <MaterialCommunityIcons name="dots-horizontal" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons name="post-outline" size={48} color={colors.textLight} />
      </View>
      <Text style={styles.emptyStateTitle}>{t('profile.noPostsYet', 'No Posts Yet')}</Text>
      <Text style={styles.emptyStateSub}>{t('profile.noPostsSub', 'This farmer hasn\'t shared any updates.')}</Text>
    </View>
  );

  const renderHeader = () => {
    if (!profile) return null;
    return (
      <View style={styles.headerWrapper}>
        <PublicProfileHeader
          farmer={profile}
          isOwnProfile={false}
          onFollowPress={() => {}}
        />
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{t('profile.farmersUpdates', 'Farmer\'s Updates')}</Text>
        </View>
      </View>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonTextLarge} />
        <View style={styles.skeletonTextSmall} />
        <View style={styles.skeletonStatsContainer}>
          <View style={styles.skeletonStat} />
          <View style={styles.skeletonStat} />
        </View>
        <View style={styles.skeletonTextSmall} />
        <View style={styles.skeletonTagsContainer}>
          <View style={styles.skeletonTag} />
          <View style={styles.skeletonTag} />
        </View>
        <View style={styles.skeletonActionBtn} />
      </View>
      <View style={styles.skeletonPost}>
        <View style={styles.skeletonPostHeader}>
          <View style={styles.skeletonPostAvatar} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.skeletonTextMedium} />
            <View style={styles.skeletonTextSmall} />
          </View>
        </View>
        <View style={styles.skeletonPostBody} />
        <View style={styles.skeletonPostImage} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderTopBar()}
        {renderSkeleton()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderTopBar()}
      
      <View style={styles.listWrapper}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ width: contentWidth, alignSelf: 'center', marginBottom: 12 }}>
              <PostCard post={item} />
            </View>
          )}
          ListHeaderComponent={
            <View style={{ width: contentWidth, alignSelf: 'center' }}>
              {renderHeader()}
            </View>
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContent,
            isWeb && { paddingBottom: 60 }
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContent: {
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    zIndex: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  topBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  moreButton: {
    padding: 8,
    marginRight: -8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    backgroundColor: '#F8F9FA',
    paddingBottom: 24,
  },
  headerWrapper: {
    marginBottom: 8,
  },
  sectionTitleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: 0,
  },
  skeletonHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: 8,
  },
  skeletonAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  skeletonTextLarge: {
    width: 160,
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 8,
  },
  skeletonTextMedium: {
    width: 120,
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonTextSmall: {
    width: 200,
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 7,
    marginBottom: 16,
  },
  skeletonStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  skeletonStat: {
    width: 60,
    height: 40,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
  skeletonTagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  skeletonTag: {
    width: 70,
    height: 30,
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
  },
  skeletonActionBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
  },
  skeletonPost: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
  },
  skeletonPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonPostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
  },
  skeletonPostBody: {
    width: '100%',
    height: 60,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonPostImage: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
  },
});
