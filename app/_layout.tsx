import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import colors from '../src/utils/colors';
import '../src/localization/i18n';
import { AuthProvider, useAuthStore } from '../src/store/authStore';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

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
      <View style={styles.splashContainer}>
        <StatusBar style="light" backgroundColor={colors.primary} />
        <View style={styles.logoBadge}>
          <Text style={styles.logoEmoji}>🌾</Text>
        </View>
        <Text style={styles.splashTitle}>KRUSHI MART</Text>
        <Text style={styles.splashSubtitle}>Connecting Farmers, Growing Together</Text>
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />
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

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E7D32', // Premium deep green
  },
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 50,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 6,
  },
  splashSubtitle: {
    fontSize: 14,
    color: '#A5D6A7', // Light green
    marginBottom: 40,
    fontWeight: '500',
  },
  spinner: {
    marginTop: 20,
  },
});
