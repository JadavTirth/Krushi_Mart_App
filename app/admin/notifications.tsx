import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Keyboard,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import {
  broadcastNotification,
  fetchBroadcastHistory,
  deleteBroadcast,
} from '../../src/services/notificationService';
import colors from '../../src/utils/colors';
import * as Haptics from 'expo-haptics';

export default function BroadcastNotificationManager() {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setHistoryLoading(true);
    }
    try {
      const data = await fetchBroadcastHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleBroadcast = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Validation Error', 'Please fill in both the Title and Message body.');
      return;
    }

    Alert.alert(
      'Confirm Broadcast',
      'This action will instantly send this notification to ALL registered users. Are you sure you want to broadcast this?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Broadcast Now',
          onPress: async () => {
            setLoading(true);
            Keyboard.dismiss();
            try {
              const priorityValue = priority ? 1 : 0;
              await broadcastNotification(user?.id, title.trim(), body.trim(), priorityValue);
              
              // Success feedback
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', 'Notification broadcasted successfully to all users!');
              
              // Reset form
              setTitle('');
              setBody('');
              setPriority(false);
              
              // Reload history
              loadHistory();
            } catch (err) {
              console.error('Failed to broadcast:', err);
              Alert.alert('Error', 'Failed to broadcast notification. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteBroadcast = async (message) => {
    Alert.alert(
      'Confirm Delete',
      'This will remove this alert from ALL users\' notification trays. Are you sure you want to delete this broadcast?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBroadcast(message);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              setHistory(prev => prev.filter(item => item.message !== message));
            } catch (err) {
              console.error('Failed to delete broadcast:', err);
              Alert.alert('Error', 'Failed to delete broadcast. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderHistoryItem = ({ item }) => {
    // Message is formatted as: 📢 Title: MessageBody. Let's parse it for clean rendering.
    let cleanTitle = 'System Alert';
    let cleanBody = item.message;
    
    if (item.message.startsWith('📢 ')) {
      const parsed = item.message.substring(2);
      const colonIndex = parsed.indexOf(': ');
      if (colonIndex > -1) {
        cleanTitle = parsed.substring(0, colonIndex);
        cleanBody = parsed.substring(colonIndex + 2);
      }
    }

    return (
      <View style={styles.historyCard}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.cardTitle}>{cleanTitle}</Text>
            {item.priority === 1 ? (
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>HIGH</Text>
              </View>
            ) : (
              <View style={[styles.priorityBadge, { backgroundColor: '#F3F4F6' }]}>
                <Text style={[styles.priorityText, { color: '#6B7280' }]}>NORMAL</Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => handleDeleteBroadcast(item.message)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardBody}>{cleanBody}</Text>
        <Text style={styles.cardTime}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={history}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderHistoryItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadHistory(true)} colors={[colors.primary]} />
      }
      ListHeaderComponent={
        <View style={styles.headerComponent}>
          {/* Title & Banner */}
          <View style={styles.broadcastBanner}>
            <MaterialCommunityIcons name="bullhorn-outline" size={24} color="#FFFFFF" />
            <Text style={styles.bannerText}>Broadcast Panel</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formHeading}>Send Announcement</Text>
            
            <Text style={styles.label}>Alert Title / Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Crop Advisory, App Update"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Message Body</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Type your message here..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={body}
              onChangeText={setBody}
            />

            {/* Priority Toggle */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>High Priority</Text>
                <Text style={styles.toggleSublabel}>Mark notification with HIGH priority badge</Text>
              </View>
              <Switch
                value={priority}
                onValueChange={setPriority}
                trackColor={{ false: '#D1D5DB', true: '#A5D6A7' }}
                thumbColor={priority ? colors.primary : '#F3F4F6'}
              />
            </View>

            {/* Submit button */}
            <TouchableOpacity
              style={styles.broadcastBtn}
              onPress={handleBroadcast}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.btnText}>Broadcast to All Users</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Broadcast History</Text>
        </View>
      }
      ListEmptyComponent={
        historyLoading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 32 }} />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bell-off-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No broadcasts sent yet.</Text>
          </View>
        )
      }
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    paddingBottom: 40,
  },
  headerComponent: {
    marginBottom: 8,
  },
  broadcastBanner: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 24,
  },
  formHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  toggleSublabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  broadcastBtn: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 8,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  priorityBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },
  deleteButton: {
    padding: 4,
  },
  cardBody: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
  },
});
