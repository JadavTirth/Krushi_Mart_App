import { Redirect } from 'expo-router';

// Redirect root to the tabs home screen
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
