import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#374151', // Dark Gray header for admin
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/profile');
              }
            }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Admin Dashboard',
        }} 
      />
      <Stack.Screen 
        name="banners" 
        options={{ 
          title: 'Manage Banners',
        }} 
      />
      <Stack.Screen 
        name="categories" 
        options={{ 
          title: 'Manage Categories',
        }} 
      />
      <Stack.Screen 
        name="products" 
        options={{ 
          title: 'Manage Products',
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          title: 'Broadcast Announcement',
        }} 
      />
      <Stack.Screen 
        name="users" 
        options={{ 
          title: 'Manage Users',
        }} 
      />
    </Stack>

  );
}

const styles = StyleSheet.create({
  backButton: {
    marginRight: 16,
    padding: 4,
  },
});
