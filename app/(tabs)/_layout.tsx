import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Platform, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import colors from '../../src/utils/colors';
import { useAuthStore } from '../../src/store/authStore';
import { supabase } from '../../src/lib/supabase';

function CustomTabBar({ state, descriptors, navigation }) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [dbAvatar, setDbAvatar] = useState(null);

  // Dynamically load user avatar from database to ensure synchronicity
  useEffect(() => {
    const loadAvatar = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('avatar_url')
            .eq('id', user.id)
            .single();
          if (data && data.avatar_url && !error) {
            setDbAvatar(data.avatar_url);
          }
        } catch (err) {
          console.log('Error loading dynamic tab avatar:', err);
        }
      }
    };
    loadAvatar();
    
    // Set up a simple interval to sync avatar in case user updates profile
    const interval = setInterval(loadAvatar, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          // Play haptic feedback on tab change
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (e) {
            console.log('Haptics failed', e);
          }

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const getTabConfig = () => {
          switch (route.name) {
            case 'index':
              return {
                iconName: isFocused ? 'home' : 'home-outline',
                label: t('tabs.home', { defaultValue: 'Home' }),
              };
            case 'community':
              return {
                iconName: isFocused ? 'account-group' : 'account-group-outline',
                label: t('tabs.community', { defaultValue: 'Community' }),
              };
            case 'medicines':
              return {
                iconName: isFocused ? 'shopping' : 'shopping-outline',
                label: t('tabs.medicines', { defaultValue: 'Shop' }),
              };
            case 'profile':
              return {
                iconName: 'account',
                label: t('tabs.profile', { defaultValue: 'Profile' }),
              };
            default:
              return {
                iconName: 'help-circle-outline',
                label: 'Tab',
              };
          }
        };

        const config = getTabConfig();
        const avatarUri = dbAvatar || user?.avatar_url || 'https://i.pravatar.cc/150?img=11';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            {/* Top Indicator Line */}
            <View style={[styles.indicatorBar, isFocused && styles.indicatorBarActive]} />

            <View style={styles.contentWrapper}>
              {route.name === 'profile' ? (
                <View style={styles.avatarWrapper}>
                  <Image 
                    source={{ uri: avatarUri }} 
                    style={[
                      styles.avatarImage, 
                      isFocused && styles.avatarImageActive
                    ]} 
                  />
                  {isFocused && <View style={styles.onlineDot} />}
                </View>
              ) : (
                <View style={styles.iconWrapper}>
                  <MaterialCommunityIcons 
                    name={config.iconName} 
                    size={24} 
                    color={isFocused ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                    {config.label}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="medicines" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    height: Platform.OS === 'ios' ? 84 : 64,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E8F5E9',
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorBar: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  indicatorBarActive: {
    backgroundColor: colors.primary,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  avatarWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  avatarImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  avatarImageActive: {
    borderColor: colors.primary,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
