import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import colors from '../../src/utils/colors';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleSendOTP = () => {
    if (phone.length >= 10) {
      const cleanPhone = phone.replace(/\s+/g, '');
      const isDemoNum = 
        cleanPhone === '9510332132' || 
        cleanPhone === '9999999999' || 
        cleanPhone === '9810332132'; // Developer test phone number

      if (isDemoNum) {
        console.log('Developer Bypass: Redirecting to OTP screen for demo number');
        router.push({ 
          pathname: '/(auth)/otp', 
          params: { phone: cleanPhone, isDemo: 'true' } 
        });
      } else {
        router.push({ 
          pathname: '/(auth)/otp', 
          params: { phone: cleanPhone } 
        });
      }
    }
  };

  const handleBack = () => {
    router.replace('/(auth)/intro');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* Top Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
          <Text style={styles.backButtonText}>Change your language</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=400&auto=format&fit=crop' }} 
            style={styles.logoImage} 
          />
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Enter your phone number to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              placeholder="Enter Phone Number"
              keyboardType="numeric"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              autoFocus
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, phone.length < 10 && styles.buttonDisabled]} 
            activeOpacity={0.8} 
            onPress={handleSendOTP}
            disabled={phone.length < 10}
          >
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  backButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  backButtonText: { marginLeft: 6, fontSize: 16, color: colors.primary, fontWeight: '600' },
  header: { paddingHorizontal: 30, paddingTop: 10, paddingBottom: 40, alignItems: 'center' },
  logoImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 24, borderWidth: 3, borderColor: '#FFFFFF', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.text, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
  form: { flex: 1, paddingHorizontal: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, height: 60, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, marginBottom: 30 },
  countryCode: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  divider: { width: 1, height: 30, backgroundColor: '#E0E0E0', marginHorizontal: 12 },
  input: { flex: 1, fontSize: 18, color: colors.text },
  button: { backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  buttonDisabled: { backgroundColor: '#A5D6A7', elevation: 0, shadowOpacity: 0 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});
