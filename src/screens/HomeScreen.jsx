import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import useFeed from '../hooks/useFeed';
import FloatingButton from '../components/common/FloatingButton';
import ScreenContainer from '../components/common/ScreenContainer';
import CommentModal from '../components/home/CommentModal';
import CreatePostModal from '../components/home/CreatePostModal';
import PostCard from '../components/home/PostCard';
import WeatherCard from '../components/home/WeatherCard';
import PhotoUploadAction from '../components/home/PhotoUploadAction';
import FarmDetailsAction from '../components/home/FarmDetailsAction';
import FarmDetailsModal from '../components/home/FarmDetailsModal';
import FarmDetailsCard from '../components/home/FarmDetailsCard';
import { MOCK_WEATHER } from '../constants/data';
import colors from '../utils/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const { posts, loading, refreshing, handleRefresh, handleLike, handleCreatePost } = useFeed();
  const [selectedPostForComment, setSelectedPostForComment] = useState(null);
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [createPostInitialPhoto, setCreatePostInitialPhoto] = useState(null);
  const [farmDetailsModalVisible, setFarmDetailsModalVisible] = useState(false);
  const [farmDetailsList, setFarmDetailsList] = useState([]);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadFarmDetails = async () => {
      try {
        const storedDetails = await AsyncStorage.getItem('@farm_details');
        if (storedDetails !== null) {
          setFarmDetailsList(JSON.parse(storedDetails));
        }
      } catch (e) {
        console.log("Failed to load farm details", e);
      }
    };
    loadFarmDetails();
  }, []);

  const handleFarmDetailsSubmit = async (newDetails) => {
    try {
      const newList = [newDetails, ...farmDetailsList];
      setFarmDetailsList(newList);
      await AsyncStorage.setItem('@farm_details', JSON.stringify(newList));
    } catch (e) {
      console.log("Failed to save farm details", e);
    }
  };

  const weatherBadgeOpacity = scrollY.interpolate({
    inputRange: [150, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const weatherBadgeTranslateY = scrollY.interpolate({
    inputRange: [150, 200],
    outputRange: [-20, 0],
    extrapolate: 'clamp',
  });

  const renderHeader = () => (
    <View style={styles.listHeaderContainer}>
      <View style={styles.headerTopRow}>
        <Text style={styles.greeting}>{t('home.goodMorning')}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={styles.notificationBtn}
            activeOpacity={0.7}
            onPress={logout}
          >
            <MaterialCommunityIcons name="logout" size={26} color="#EF5350" />
          </TouchableOpacity>
 
          <TouchableOpacity
            style={styles.notificationBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/notifications')}
          >
            <MaterialCommunityIcons name="bell-outline" size={26} color={colors.text} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>
      <WeatherCard weather={MOCK_WEATHER} scrollY={scrollY} />

      {/* Photo Upload Action */}
      <PhotoUploadAction onPhotoSelected={(uri) => {
        setCreatePostInitialPhoto(uri);
        setCreatePostModalVisible(true);
      }} />

      {/* Share Farm Details Action */}
      <FarmDetailsAction 
        onPress={() => setFarmDetailsModalVisible(true)} 
        isUpdate={farmDetailsList.length > 0}
      />

      {/* Render Farm Details Cards if any */}
      {farmDetailsList.map((details) => (
        <FarmDetailsCard key={details.id} details={details} />
      ))}
    </View>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="post-outline" size={48} color={colors.textLight} />
        <Text style={styles.emptyText}>{t('home.noPostsYet') || 'No posts available'}</Text>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <Animated.FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onCommentPress={() => setSelectedPostForComment(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true } // Native driver true since we only animate opacity/transform
        )}
        scrollEventThrottle={16}
      />

      <Animated.View pointerEvents="none" style={[styles.floatingWeatherBadge, { opacity: weatherBadgeOpacity, transform: [{ translateY: weatherBadgeTranslateY }] }]}>
        <Text style={styles.weatherBadgeText}>{MOCK_WEATHER.temp}°</Text>
      </Animated.View>

      <FloatingButton
        icon="plus"
        label={t('home.post')}
        onPress={() => setCreatePostModalVisible(true)}
      />

      <CommentModal
        visible={!!selectedPostForComment}
        post={selectedPostForComment}
        onClose={() => setSelectedPostForComment(null)}
      />

      <CreatePostModal
        visible={createPostModalVisible}
        initialPhoto={createPostInitialPhoto}
        onSubmit={handleCreatePost}
        onClose={() => {
          setCreatePostModalVisible(false);
          setCreatePostInitialPhoto(null);
        }}
      />

      <FarmDetailsModal
        visible={farmDetailsModalVisible}
        onClose={() => setFarmDetailsModalVisible(false)}
        onSubmit={handleFarmDetailsSubmit}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 90,
  },
  listHeaderContainer: {
    paddingBottom: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error || '#FF3B30',
    borderWidth: 1,
    borderColor: colors.surfaceCard,
  },
  floatingWeatherBadge: {
    position: 'absolute',
    top: 20,
    right: 16,
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 100,
  },
  weatherBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
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
});
