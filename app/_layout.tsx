import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import colors from '../src/utils/colors';
import '../src/localization/i18n';
import { AuthProvider, useAuthStore } from '../src/store/authStore';
import { View, ActivityIndicator } from 'react-native';

function RootNavigation() {
  const { isLoggedIn, hasSeenIntro, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isLoggedIn && !inAuthGroup) {
      if (!hasSeenIntro) {
        router.replace('/(auth)/intro');
      } else {
        router.replace('/(auth)/login');
      }
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, hasSeenIntro, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <RootNavigation />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
