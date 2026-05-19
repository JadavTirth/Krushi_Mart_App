import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../components/common/AppHeader';
import ScreenContainer from '../components/common/ScreenContainer';
import colors from '../utils/colors';

const DEMO_NOTIFICATIONS = [
  {
    id: '1',
    type: 'alert',
    title: 'Weather Alert',
    message: 'Heavy rain expected tomorrow in your area.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'comment',
    title: 'New Comment',
    message: 'Suresh Patel commented on your post.',
    time: '5 hours ago',
    read: false,
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: '3',
    type: 'like',
    title: 'Post Liked',
    message: 'Amit Bhai and 12 others liked your farming tip.',
    time: '1 day ago',
    read: true,
    avatar: 'https://i.pravatar.cc/150?img=59',
  },
  {
    id: '4',
    type: 'system',
    title: 'Market Update',
    message: 'Cotton prices have gone up by 5% today.',
    time: '2 days ago',
    read: true,
  },
];

const getIconConfig = (type) => {
  switch (type) {
    case 'alert':
      return { name: 'weather-lightning-rainy', color: '#FF3B30', bgColor: '#FFEBEA' };
    case 'comment':
      return { name: 'comment-text-outline', color: '#4CAF50', bgColor: '#E8F5E9' };
    case 'like':
      return { name: 'thumb-up-outline', color: '#2196F3', bgColor: '#E3F2FD' };
    case 'system':
      return { name: 'trending-up', color: '#FF9800', bgColor: '#FFF3E0' };
    default:
      return { name: 'bell-outline', color: colors.primary, bgColor: colors.surfaceCard };
  }
};

export default function NotificationScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const renderItem = ({ item }) => {
    const iconConfig = getIconConfig(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.unreadCard]}
        activeOpacity={0.7}
      >
        <View style={styles.leftSection}>
          {item.avatar ? (
            <View style={styles.avatarContainer}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={[styles.smallIconBadge, { backgroundColor: iconConfig.color }]}>
                <MaterialCommunityIcons name={iconConfig.name} size={12} color="#FFF" />
              </View>
            </View>
          ) : (
            <View style={[styles.iconContainer, { backgroundColor: iconConfig.bgColor }]}>
              <MaterialCommunityIcons name={iconConfig.name} size={32} color={iconConfig.color} />
            </View>
          )}
        </View>

        <View style={styles.contentSection}>
          <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <AppHeader title={`🔔 ${t('notifications.title')}`} onBack={() => router.back()} />
      <FlatList
        data={DEMO_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bell-sleep-outline" size={72} color={colors.textLight} />
            <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 80,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 16,
    alignItems: 'center',
  },
  unreadCard: {
    backgroundColor: '#F4F8EE',
    borderColor: '#D0E6C5',
  },
  leftSection: {
    marginRight: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  smallIconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contentSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  unreadText: {
    color: colors.primaryDark || '#000',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error || '#FF3B30',
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    fontWeight: '600',
  },
});
