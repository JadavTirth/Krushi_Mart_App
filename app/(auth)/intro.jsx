import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useTranslation } from 'react-i18next';
import colors from '../../src/utils/colors';

const { width } = Dimensions.get('window');

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' }
];

export default function IntroScreen() {
  const [selectedLang, setSelectedLang] = useState('en');
  const router = useRouter();
  const { markIntroSeen } = useAuthStore();
  const { i18n } = useTranslation();

  const handleLanguageSelect = (code) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
  };

  const handleContinue = async () => {
    await markIntroSeen();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=400&auto=format&fit=crop' }} 
          style={styles.logoImage} 
        />
        <Text style={styles.title}>Welcome to Krushi Mart</Text>
        <Text style={styles.subtitle}>Select your language</Text>
      </View>

      <View style={styles.cardsContainer}>
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLang === lang.code;
          return (
            <TouchableOpacity 
              key={lang.code}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => handleLanguageSelect(lang.code)}
              activeOpacity={0.8}
            >
              <Text style={[styles.nativeText, isSelected && styles.textSelected]}>
                {lang.native}
              </Text>
              <Text style={[styles.label, isSelected && styles.textSelected]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 32 },
  logoImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 24, borderWidth: 3, borderColor: '#FFFFFF', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
  cardsContainer: { paddingHorizontal: 20, gap: 16 },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 24, 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0FAF5', 
  },
  nativeText: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  label: { fontSize: 15, color: colors.textSecondary },
  textSelected: { color: colors.primary },
  footer: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 30, paddingBottom: 60 },
  button: { backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});
