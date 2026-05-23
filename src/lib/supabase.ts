import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const DEMO_USER = {
  id: 'd3b07384-d113-4ec5-a58e-0a0d6e6a12b4', // Valid UUID v4
  name: 'Demo Farmer',
  phone: '+91 99999 99999',
  avatar_url: 'https://i.pravatar.cc/150?img=11',
  village: 'Rampur',
  district: 'Ahmedabad',
  state: 'Gujarat',
  farm_type: 'Organic',
  experience_years: 12,
  bio: 'Organic farming enthusiast.',
  primary_crops: ['Cotton', 'Wheat'],
};

// Programmatically ensure the demo user exists in public.users on app startup
export async function ensureDemoUserExists() {
  try {
    const { error } = await supabase.from('users').upsert(
      {
        id: DEMO_USER.id,
        name: DEMO_USER.name,
        phone: DEMO_USER.phone,
        avatar_url: DEMO_USER.avatar_url,
        village: DEMO_USER.village,
        district: DEMO_USER.district,
        state: DEMO_USER.state,
        farm_type: DEMO_USER.farm_type,
        bio: DEMO_USER.bio,
        primary_crops: DEMO_USER.primary_crops,
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('Upserting demo user warning (seed manually if RLS is enabled):', error.message);
    } else {
      console.log('Demo user successfully upserted/verified in DB.');
    }
  } catch (err) {
    console.error('Error verifying/upserting demo user:', err);
  }
}
