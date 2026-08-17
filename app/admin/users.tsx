import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import colors from '../../src/utils/colors';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Modal details state
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [farmDetails, setFarmDetails] = useState([]);
  const [farmLoading, setFarmLoading] = useState(false);

  const fetchUsers = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      Alert.alert('Error', 'Failed to fetch users list.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserFarmDetails = async (userId) => {
    setFarmLoading(true);
    setFarmDetails([]);
    try {
      const { data, error } = await supabase
        .from('farming_problems')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFarmDetails(data || []);
    } catch (err) {
      console.error('Error fetching farm details:', err);
      Alert.alert('Error', 'Failed to fetch farm details for this user.');
    } finally {
      setFarmLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDetails = (userItem) => {
    setSelectedUser(userItem);
    setDetailModalVisible(true);
    fetchUserFarmDetails(userItem.id);
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
    setDetailModalVisible(false);
    setFarmDetails([]);
  };

  // Filter users locally based on query
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.village && u.village.toLowerCase().includes(q)) ||
      (u.state && u.state.toLowerCase().includes(q))
    );
  });

  const renderUserItem = ({ item }) => {
    const locationStr = [item.village, item.state].filter(Boolean).join(', ') || item.district || 'Location not specified';
    const crops = item.primary_crops || [];

    return (
      <TouchableOpacity
        style={styles.userCard}
        activeOpacity={0.7}
        onPress={() => handleOpenDetails(item)}
      >
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: item.avatar_url || 'https://i.pravatar.cc/150?img=11' }}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{item.name}</Text>
              {item.is_verified && (
                <MaterialCommunityIcons name="check-decagram" size={16} color={colors.primary} style={styles.badgeIcon} />
              )}
              {item.is_admin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
            </View>
            <Text style={styles.userPhone}>📞 {item.phone}</Text>
            <Text style={styles.userLocation}>📍 {locationStr}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
        </View>

        {crops.length > 0 && (
          <View style={styles.cropsRow}>
            {crops.slice(0, 3).map((crop, idx) => (
              <View key={idx} style={styles.cropChip}>
                <Text style={styles.cropText}>🌾 {crop}</Text>
              </View>
            ))}
            {crops.length > 3 && (
              <View style={[styles.cropChip, { backgroundColor: '#F3F4F6' }]}>
                <Text style={[styles.cropText, { color: '#6B7280' }]}>+{crops.length - 3} more</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFarmItem = (item) => {
    return (
      <View key={item.id} style={styles.farmCard}>
        <View style={styles.farmHeader}>
          <View>
            <Text style={styles.farmCropName}>🌱 {item.crop_name}</Text>
            <Text style={styles.farmArea}>📐 Area: {item.area || 'N/A'}</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Farm properties grid */}
        <View style={styles.propertiesGrid}>
          {item.soil_type && (
            <View style={styles.propertyItem}>
              <Text style={styles.propertyLabel}>Soil Type</Text>
              <Text style={styles.propertyValue}>{item.soil_type}</Text>
            </View>
          )}
          {item.water_source && (
            <View style={styles.propertyItem}>
              <Text style={styles.propertyLabel}>Water Source</Text>
              <Text style={styles.propertyValue}>{item.water_source}</Text>
            </View>
          )}
        </View>

        {item.description ? (
          <Text style={styles.farmDesc}>{item.description}</Text>
        ) : null}

        {item.image_url ? (
          <View style={styles.farmImageContainer}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.farmImage}
              resizeMode="cover"
            />
          </View>
        ) : (
          <View style={styles.noImagePlaceholder}>
            <MaterialCommunityIcons name="image-off-outline" size={24} color="#9CA3AF" />
            <Text style={styles.noImageText}>No plot photo uploaded</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <MaterialCommunityIcons name="magnify" size={22} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone, village..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Directory List */}
      {loading && users.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading registered users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          refreshing={refreshing}
          onRefresh={() => fetchUsers(true)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-search-outline" size={54} color="#9CA3AF" />
              <Text style={styles.emptyText}>No users found matching query</Text>
            </View>
          }
        />
      )}

      {/* Details View Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        onRequestClose={handleCloseDetails}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleCloseDetails}>
              <MaterialCommunityIcons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>User Details</Text>
            <View style={{ width: 40 }} />
          </View>

          {selectedUser ? (
            <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              
              {/* Profile Card (Section 1) */}
              <View style={styles.sectionHeaderBanner}>
                <MaterialCommunityIcons name="account-circle-outline" size={22} color="#FFFFFF" />
                <Text style={styles.sectionBannerText}>Profile Section</Text>
              </View>

              <View style={styles.profileCard}>
                <View style={styles.profileHero}>
                  <Image
                    source={{ uri: selectedUser.avatar_url || 'https://i.pravatar.cc/150?img=11' }}
                    style={styles.profileAvatar}
                  />
                  <Text style={styles.profileName}>{selectedUser.name}</Text>
                  <View style={styles.badgesRow}>
                    {selectedUser.is_verified && (
                      <View style={[styles.inlineBadge, { backgroundColor: '#E8F5E9' }]}>
                        <MaterialCommunityIcons name="check-decagram" size={14} color={colors.primary} />
                        <Text style={[styles.inlineBadgeText, { color: colors.primary }]}>Verified</Text>
                      </View>
                    )}
                    {selectedUser.is_admin && (
                      <View style={[styles.inlineBadge, { backgroundColor: '#F3E5F5' }]}>
                        <MaterialCommunityIcons name="shield-crown" size={14} color="#8B5CF6" />
                        <Text style={[styles.inlineBadgeText, { color: '#8B5CF6' }]}>Admin</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.profileDetailsList}>
                  <View style={styles.profileDetailRow}>
                    <MaterialCommunityIcons name="phone-outline" size={20} color="#6B7280" style={styles.rowIcon} />
                    <View>
                      <Text style={styles.rowLabel}>Phone Number</Text>
                      <Text style={styles.rowValue}>{selectedUser.phone}</Text>
                    </View>
                  </View>

                  <View style={styles.profileDetailRow}>
                    <MaterialCommunityIcons name="email-outline" size={20} color="#6B7280" style={styles.rowIcon} />
                    <View>
                      <Text style={styles.rowLabel}>Email Address</Text>
                      <Text style={styles.rowValue}>{selectedUser.email || 'Not provided'}</Text>
                    </View>
                  </View>

                  <View style={styles.profileDetailRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={20} color="#6B7280" style={styles.rowIcon} />
                    <View>
                      <Text style={styles.rowLabel}>Location</Text>
                      <Text style={styles.rowValue}>
                        {[selectedUser.village, selectedUser.district, selectedUser.state].filter(Boolean).join(', ') || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.profileDetailRow}>
                    <MaterialCommunityIcons name="sprout-outline" size={20} color="#6B7280" style={styles.rowIcon} />
                    <View>
                      <Text style={styles.rowLabel}>Farm Type & Experience</Text>
                      <Text style={styles.rowValue}>
                        {selectedUser.farm_type || 'General'} Farming ({selectedUser.experience_years !== null ? `${selectedUser.experience_years} Years` : 'N/A'})
                      </Text>
                    </View>
                  </View>

                  {selectedUser.primary_crops && selectedUser.primary_crops.length > 0 && (
                    <View style={styles.profileDetailRow}>
                      <MaterialCommunityIcons name="leaf" size={20} color="#6B7280" style={styles.rowIcon} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowLabel}>Primary Crops</Text>
                        <View style={styles.cropsBadgeGrid}>
                          {selectedUser.primary_crops.map((crop, idx) => (
                            <View key={idx} style={[styles.cropChip, { marginVertical: 4 }]}>
                              <Text style={styles.cropText}>🌾 {crop}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}

                  {selectedUser.bio ? (
                    <View style={[styles.profileDetailRow, { borderBottomWidth: 0 }]}>
                      <MaterialCommunityIcons name="information-outline" size={20} color="#6B7280" style={styles.rowIcon} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowLabel}>Farmer Bio</Text>
                        <Text style={styles.bioBlock}>{selectedUser.bio}</Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Farm Card (Section 2) */}
              <View style={[styles.sectionHeaderBanner, { backgroundColor: '#10B981', marginTop: 16 }]}>
                <MaterialCommunityIcons name="sprout" size={22} color="#FFFFFF" />
                <Text style={styles.sectionBannerText}>Farm Section & Logs</Text>
              </View>

              {farmLoading ? (
                <View style={styles.farmLoaderContainer}>
                  <ActivityIndicator size="small" color="#10B981" />
                  <Text style={styles.farmLoaderText}>Fetching farm logs...</Text>
                </View>
              ) : farmDetails.length > 0 ? (
                <View style={styles.farmSectionContent}>
                  {farmDetails.map((plot) => renderFarmItem(plot))}
                </View>
              ) : (
                <View style={styles.emptyFarmBox}>
                  <MaterialCommunityIcons name="alert-box-outline" size={36} color="#9CA3AF" />
                  <Text style={styles.emptyFarmText}>No farm logs or telemetry saved for this user.</Text>
                </View>
              )}

            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
    backgroundColor: '#E5E7EB',
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  badgeIcon: {
    marginLeft: 2,
  },
  adminBadge: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  userPhone: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  userLocation: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
  cropsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 6,
  },
  cropChip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cropText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  closeBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeaderBanner: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  sectionBannerText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  profileHero: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#F3F4F6',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  inlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  profileDetailsList: {
    gap: 16,
  },
  profileDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    paddingBottom: 12,
  },
  rowIcon: {
    marginRight: 14,
    marginTop: 2,
  },
  rowLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '700',
    marginTop: 2,
  },
  cropsBadgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  bioBlock: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 4,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#D1D5DB',
  },
  farmLoaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 8,
  },
  farmLoaderText: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyFarmBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyFarmText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
  farmSectionContent: {
    gap: 16,
  },
  farmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  farmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
    marginBottom: 12,
  },
  farmCropName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  farmArea: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  dateBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '700',
  },
  propertiesGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  propertyItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  propertyLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  propertyValue: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '700',
    marginTop: 1,
  },
  farmDesc: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  farmImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  farmImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 20,
    gap: 8,
  },
  noImageText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
