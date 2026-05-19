import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import colors from '../utils/colors';
import ScreenContainer from '../components/common/ScreenContainer';
import AnimatedInput from '../components/common/AnimatedInput';

const MOCK_FARMERS = [
  {
    id: '1',
    name: 'Ramesh Patel',
    avatar: 'https://i.pravatar.cc/150?img=11',
    location: 'Ahmedabad, Gujarat',
    farmType: 'Organic',
    crops: ['Cotton', 'Wheat'],
    bio: 'Farming organically for 15 years. Happy to help young farmers.',
    verified: true,
  },
  {
    id: '2',
    name: 'Suresh Kumar',
    avatar: 'https://i.pravatar.cc/150?img=12',
    location: 'Rajkot, Gujarat',
    farmType: 'Traditional',
    crops: ['Groundnut', 'Cotton'],
    bio: 'Specializing in monsoon crops and traditional farming methods.',
    verified: false,
  },
  {
    id: '3',
    name: 'Amit Bhai',
    avatar: 'https://i.pravatar.cc/150?img=14',
    location: 'Surat, Gujarat',
    farmType: 'Modern',
    crops: ['Vegetable', 'Dairy'],
    bio: 'Using modern tech for better yield. Let us connect!',
    verified: true,
  },
  {
    id: '4',
    name: 'Dilip Singh',
    avatar: 'https://i.pravatar.cc/150?img=59',
    location: 'Bhavnagar, Gujarat',
    farmType: 'Organic',
    crops: ['Mango', 'Vegetable'],
    bio: 'Looking for organic compost suppliers. Sharing tips on mango farming.',
    verified: false,
  },
];

export default function CommunityScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFarmers = MOCK_FARMERS.filter(farmer => {
    return farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           farmer.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

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

  const renderFarmerCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/farmer/${item.id}`)}
    >
      <View style={styles.cardTopRow}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            {item.verified && (
              <MaterialCommunityIcons name="check-decagram" size={16} color={colors.primary} style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={styles.location}>📍 {item.location}</Text>
          <Text style={styles.farmType}>🌿 {item.farmType}</Text>
        </View>
        <TouchableOpacity style={styles.addFriendButton} activeOpacity={0.7}>
          <MaterialCommunityIcons name="account-plus-outline" size={18} color="#FFFFFF" />
          <Text style={styles.addFriendText}>Add</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.bio}>{item.bio}</Text>
      
      <View style={styles.cardBottomRow}>
        <View style={styles.cropsContainer}>
          {item.crops.map((crop, idx) => (
            <Text key={idx} style={styles.cropText}>🌾 {crop}</Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <FlatList
        data={filteredFarmers}
        keyExtractor={item => item.id}
        renderItem={renderFarmerCard}
        ListHeaderComponent={headerElement}
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
});
