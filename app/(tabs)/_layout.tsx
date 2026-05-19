import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '../../src/utils/colors';

const TAB_BAR_HEIGHT = 78;

// Custom tab bar icon with label
function TabIcon({ emoji, label, focused }) {
  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
      <View style={[styles.iconPill, focused && styles.iconPillActive]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.tabIconActive,
        tabBarInactiveTintColor: colors.tabIconInactive,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label={t('tabs.home')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t('tabs.community', { defaultValue: 'Community' }),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🤝" label={t('tabs.community', { defaultValue: 'Community' })} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="medicines"
        options={{
          title: t('tabs.medicines'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💊" label={t('tabs.medicines')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label={t('tabs.profile')} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: TAB_BAR_HEIGHT,
    backgroundColor: colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: colors.tabBarBorder,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    paddingTop: 8,
    elevation: 12,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 76,
  },
  tabIconContainerActive: {},
  iconPill: {
    width: 52,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconPillActive: {
    backgroundColor: colors.tabBarBorder,
  },
  emoji: {
    fontSize: 26,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.tabIconInactive,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.tabIconActive,
    fontWeight: '700',
  },
});
