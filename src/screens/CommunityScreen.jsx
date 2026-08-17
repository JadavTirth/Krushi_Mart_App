import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import colors from '../utils/colors';
import ScreenContainer from '../components/common/ScreenContainer';
import AnimatedInput from '../components/common/AnimatedInput';
import { fetchFarmers } from '../services/profileService';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function CommunityScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFarmers = async () => {
      setLoading(true);
      try {
        // 1. Fetch all farmers matching the search query
        const data = await fetchFarmers(searchQuery);

        // 2. Fetch connection relations to exclude existing friends
        let friendIds = [];
        if (user?.id) {
          const { data: followersData, error: followersError } = await supabase
            .from('followers')
            .select('follower_id, following_id')
            .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`);

          if (!followersError && followersData) {
            friendIds = followersData.map(row => 
              row.follower_id === user.id ? row.following_id : row.follower_id
            );
          } else if (followersError) {
            console.warn('Error fetching followers list:', followersError.message);
          }
        }

        // 3. Filter out:
        // - Logged-in user themselves
        // - Anyone who is already in their friend/connection list
        const filteredFarmers = (data || []).filter(farmer => 
          farmer.id !== user?.id && !friendIds.includes(farmer.id)
        );
        setFarmers(filteredFarmers);
      } catch (err) {
        console.error('Failed to load farmers list:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadFarmers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, user?.id]);

  const handleAddFriend = async (targetFarmerId, targetFarmerName) => {
    if (!user?.id) {
      Alert.alert('Authentication Required', 'Please log in to add connections.');
      return;
    }

    try {
      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: user.id,
          following_id: targetFarmerId,
          status: 'approved'
        });

      if (error) throw error;

      // Optimistically remove the connection from the directory feed list
      setFarmers(prev => prev.filter(f => f.id !== targetFarmerId));
      Alert.alert('Connected', `You are now connected with ${targetFarmerName}!`);
    } catch (err) {
      console.error('Error adding friend:', err);
      Alert.alert('Connection Failed', err.message || 'Could not send connection request.');
    }
  };

  const headerElement = (
    <View style={styles.headerSection}>
      <View style={styles.searchContainer}>
        <AnimatedInput
          placeholder="Search farmers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="magnify"
          rightIcon={searchQuery.length > 0 ? "close-circle" : undefined}
          onRightIconPress={() => setSearchQuery('')}
        />
      </View>
    </View>
  );

  const renderFarmerCard = ({ item }) => {
    const locationStr = [item.village, item.state].filter(Boolean).join(', ') || item.district || 'Unknown Location';
    
    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push(`/farmer/${item.id}`)}
      >
        <View style={styles.cardTopRow}>
          <Image source={{ uri: item.avatar_url || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{item.name}</Text>
              {item.is_verified && (
                <MaterialCommunityIcons name="check-decagram" size={16} color={colors.primary} style={styles.verifiedIcon} />
              )}
            </View>
            <Text style={styles.location}>📍 {locationStr}</Text>
            <Text style={styles.farmType}>🌿 {item.farm_type || 'General Farming'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.addFriendButton} 
            activeOpacity={0.7}
            onPress={() => handleAddFriend(item.id, item.name)}
          >
            <MaterialCommunityIcons name="account-plus-outline" size={18} color="#FFFFFF" />
            <Text style={styles.addFriendText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        {item.bio && <Text style={styles.bio}>{item.bio}</Text>}
        
        <View style={styles.cardBottomRow}>
          <View style={styles.cropsContainer}>
            {(item.primary_crops || []).map((crop, idx) => (
              <Text key={idx} style={styles.cropText}>🌾 {crop}</Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        <MaterialCommunityIcons name="account-search-outline" size={48} color={colors.textLight} />
        <Text style={styles.emptyText}>No farmers found matching search query</Text>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <FlatList
        data={farmers}
        keyExtractor={item => item.id}
        renderItem={renderFarmerCard}
        ListHeaderComponent={headerElement}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: colors.background,
    paddingBottom: 12,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8, // Soft separation between cards without borders
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    backgroundColor: colors.divider,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginRight: 4,
  },
  verifiedIcon: {
    marginTop: 2,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  farmType: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  bio: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 8,
  },
  cropText: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
  },
  addFriendText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
});
