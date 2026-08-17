import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchDashboardStats } from '../../src/services/productService';
const isWeb = Platform.OS === 'web';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError('Could not load dashboard stats. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const renderStatCard = (title, value, icon, cardColor, onPress = null, textCol = '#FFFFFF') => {
    const CardComponent = onPress ? TouchableOpacity : View;
    return (
      <CardComponent 
        style={[styles.statCard, { backgroundColor: cardColor }]}
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
      >
        <View style={styles.statHeader}>
          <Text style={[styles.statTitle, { color: textCol }]}>{title}</Text>
          <MaterialCommunityIcons name={icon} size={28} color={textCol} style={styles.statIcon} />
        </View>
        <Text style={[styles.statValue, { color: textCol }]}>{value}</Text>
      </CardComponent>
    );
  };

  const renderQuickLink = (title, subtitle, icon, route, colorCode) => (
    <TouchableOpacity 
      style={[styles.quickLink, { borderLeftColor: colorCode }]} 
      onPress={() => router.push(route)}
      activeOpacity={0.7}
    >
      <View style={[styles.linkIconCircle, { backgroundColor: `${colorCode}15` }]}>
        <MaterialCommunityIcons name={icon} size={28} color={colorCode} />
      </View>
      <View style={styles.linkTextContainer}>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.linkSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (loading && !stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#374151" />
        <Text style={styles.loadingText}>Loading Dashboard Statistics...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadStats(true)} colors={['#374151']} />
      }
    >
      {/* Overview Header */}
      <View style={styles.overviewHeader}>
        <Text style={styles.greetingText}>Welcome, Store Admin</Text>
        <Text style={styles.subtitleText}>Manage your catalog, banners, and categories in real-time.</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadStats()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Stats Cards Grid */}
      <View style={styles.statsGrid}>
        {renderStatCard('Total Products', stats?.totalProducts || 0, 'package-variant-closed', '#3B82F6')}
        {renderStatCard('Total Categories', stats?.totalCategories || 0, 'shape-outline', '#10B981')}
        {renderStatCard('Total Orders', stats?.totalOrders || 0, 'cart-outline', '#F59E0B')}
        {renderStatCard('Total Users', stats?.totalUsers || 0, 'account-group-outline', '#8B5CF6', () => router.push('/admin/users'))}
      </View>

      {/* Quick Navigation Sections */}
      <Text style={styles.sectionTitle}>Catalog Management</Text>
      <View style={styles.quickLinksContainer}>
        {renderQuickLink('Manage Banners', 'Update home sliders & offers', 'image-multiple-outline', '/admin/banners', '#3B82F6')}
        {renderQuickLink('Manage Categories', 'Create & edit product categories', 'shape-outline', '/admin/categories', '#10B981')}
        {renderQuickLink('Manage Products', 'Full CRUD operations for inventory', 'package-variant-closed', '/admin/products', '#F59E0B')}
      </View>

      <Text style={styles.sectionTitle}>User Management</Text>
      <View style={styles.quickLinksContainer}>
        {renderQuickLink('Manage Users', 'View user profiles & farm details', 'account-group-outline', '/admin/users', '#8B5CF6')}
      </View>

      <Text style={styles.sectionTitle}>Communications</Text>
      <View style={styles.quickLinksContainer}>
        {renderQuickLink('Broadcast Announcement', 'Send alerts & news to all users', 'bell-ring-outline', '/admin/notifications', '#8B5CF6')}
      </View>


      {/* Recent Activity Feed */}
      <Text style={styles.sectionTitle}>Recent Activities</Text>
      <View style={styles.activityBox}>
        {stats?.recentActivities && stats.recentActivities.length > 0 ? (
          stats.recentActivities.map((act) => (
            <View key={act.id} style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: act.type === 'product' ? '#F59E0B' : '#10B981' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{act.title}</Text>
                <Text style={styles.activityTime}>{new Date(act.time).toLocaleString()}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noActivitiesText}>No recent activities logged.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  overviewHeader: {
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    color: '#991B1B',
    fontSize: 14,
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: isWeb ? '23%' : '47%',
    minWidth: 140,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statIcon: {
    opacity: 0.8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 16,
  },
  quickLinksContainer: {
    marginBottom: 24,
    gap: 12,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  linkIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  linkTextContainer: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  activityBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  noActivitiesText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  noActivities: {
    alignItems: 'center',
    padding: 20,
  },
});
