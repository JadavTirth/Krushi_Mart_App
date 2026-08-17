import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/authStore';
import colors from '../../src/utils/colors';

const CELL_COUNT = 6;

export default function OTPScreen() {
  const { phone, fullPhone, isDemo } = useLocalSearchParams();
  const router = useRouter();
  const { login } = useAuthStore();
  const [value, setValue] = useState('');
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [demoMode, setDemoMode] = useState(isDemo === 'true');

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Send initial OTP on mount if not demo mode
  useEffect(() => {
    if (!demoMode) {
      sendInitialOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendInitialOTP = async () => {
    setIsLoading(true);
    const targetPhone = fullPhone || `+91${phone}`;
    try {
      console.log('Requesting Supabase OTP for:', targetPhone);
      const { error } = await supabase.auth.signInWithOtp({
        phone: targetPhone,
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending OTP:', err);
      
      const errorMsg = err.message || '';
      if (errorMsg.includes('Unsupported phone provider')) {
        Alert.alert(
          'Phone Provider Not Configured',
          'Supabase OTP sending is not configured (Unsupported phone provider).\n\nWould you like to use the Developer Bypass for this session?',
          [
            {
              text: 'Use Bypass (Code: 123456)',
              onPress: () => {
                setDemoMode(true);
                Alert.alert('Developer Bypass Active', 'You can now log in using the verification code: 123456');
              }
            },
            {
              text: 'Cancel',
              onPress: () => router.back(),
              style: 'cancel'
            }
          ]
        );
        return;
      }

      let errorMessage = 'Could not send verification code. Please try again.';
      if (errorMsg.toLowerCase().includes('network') || errorMsg.toLowerCase().includes('fetch')) {
        errorMessage = 'No internet connection. Please verify your connection and try again.';
      } else if (errorMsg) {
        errorMessage = errorMsg;
      }
      Alert.alert('Verification Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (value.length !== CELL_COUNT) {
      Alert.alert('Incomplete Code', `Please enter all ${CELL_COUNT} digits of the OTP.`);
      return;
    }

    setIsLoading(true);
    const targetPhone = fullPhone || `+91${phone}`;

    if (demoMode) {
      if (value !== '123456') {
        setIsLoading(false);
        Alert.alert('Verification Failed', 'Incorrect OTP. For testing, please use 123456.');
        return;
      }

      try {
        console.log('Developer Bypass: Logging in with seeded Demo Farmer ID');
        const demoUserId = 'd3b07384-d113-4ec5-a58e-0a0d6e6a12b4';
        
        await login({
          user: {
            id: demoUserId,
            phone: targetPhone,
            email: 'demo.farmer@example.com',
          }
        }, true);
      } catch (err) {
        console.error('Bypass verification error:', err);
        Alert.alert('Verification Failed', 'Failed to fetch demo profile from database.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      console.log('Verifying OTP for:', targetPhone, 'code:', value);
      const { data, error } = await supabase.auth.verifyOtp({
        phone: targetPhone,
        token: value,
        type: 'sms',
      });

      if (error) throw error;

      if (data && data.user) {
        console.log('OTP verified successfully. Syncing user profile...');
        
        // Defensive profile creation/verification in public.users
        const { error: upsertError } = await supabase.from('users').upsert({
          id: data.user.id,
          phone: data.user.phone || targetPhone,
          name: 'New Farmer',
        });

        if (upsertError) {
          console.warn('Defensive profile upsert failed:', upsertError.message);
        }

        // Set local context auth state (triggers routing redirect to tabs)
        if (data.session) {
          await login(data.session);
        }
      } else {
        throw new Error('No user profile returned from authentication.');
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      let errorMessage = 'The verification code entered is incorrect. Please try again.';
      if (err.message && (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('fetch'))) {
        errorMessage = 'No internet connection. Please verify your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    const targetPhone = fullPhone || `+91${phone}`;

    if (demoMode) {
      setTimeout(() => {
        Alert.alert('Code Resent', `For testing, the code remains 123456.`);
        setTimer(30);
        setValue('');
        setIsResending(false);
      }, 500);
      return;
    }

    try {
      console.log('Resending OTP to:', targetPhone);
      const { error } = await supabase.auth.signInWithOtp({
        phone: targetPhone,
      });

      if (error) throw error;

      Alert.alert('Code Resent', `A new verification code has been sent to ${targetPhone}.`);
      setTimer(30);
      setValue('');
    } catch (err) {
      console.error('Resend OTP Error:', err);
      Alert.alert('Resend Failed', err.message || 'Could not send verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="shield-lock-outline" size={54} color={colors.primary} />
            </View>
            <Text style={styles.title}>Enter OTP Code</Text>
            <Text style={styles.subtitle}>
              We sent a 4-digit verification code to
            </Text>
            <Text style={styles.phoneNumber}>
              {fullPhone || `+91 ${phone}`}
            </Text>
          </View>

          <View style={styles.form}>
            {/* Custom 6-digit OTP field */}
            <CodeField
              ref={ref}
              {...props}
              value={value}
              onChangeText={setValue}
              cellCount={CELL_COUNT}
              rootStyle={styles.codeFieldRoot}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoFocus
              renderCell={({ index, symbol, isFocused }) => (
                <View
                  onLayout={getCellOnLayoutHandler(index)}
                  key={index}
                  style={[styles.cell, isFocused && styles.focusCell]}
                >
                  <Text style={styles.cellText}>
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </Text>
                </View>
              )}
            />

            <TouchableOpacity 
              style={[styles.button, value.length < CELL_COUNT && styles.buttonDisabled]} 
              activeOpacity={0.8} 
              onPress={verifyOTP}
              disabled={value.length < CELL_COUNT || isLoading}
            >
              <LinearGradient
                colors={value.length < CELL_COUNT ? ['#C8E6C9', '#A5D6A7'] : [colors.primary, colors.primaryDark]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Verify OTP Code</Text>
                    <MaterialCommunityIcons name="check-decagram" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResendOTP} disabled={isResending}>
                  {isResending ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={styles.resendLink}>Resend Now</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  backBtn: { 
    padding: 20, 
    paddingTop: 10 
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: { 
    paddingHorizontal: 30, 
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: colors.text, 
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: { 
    fontSize: 15, 
    color: colors.textSecondary, 
    lineHeight: 22,
    textAlign: 'center'
  },
  phoneNumber: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
  },
  form: { 
    paddingHorizontal: 30 
  },
  codeFieldRoot: {
    marginTop: 20,
    marginBottom: 40,
    justifyContent: 'center',
  },
  cell: {
    width: 44,
    height: 56,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginHorizontal: 4,
  },
  focusCell: {
    borderColor: colors.primary,
    backgroundColor: '#F4F8EE',
  },
  cellText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  button: { 
    borderRadius: 16, 
    overflow: 'hidden',
    elevation: 4, 
    shadowColor: colors.primary, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 8, 
    marginBottom: 30 
  },
  buttonDisabled: { 
    elevation: 0, 
    shadowOpacity: 0 
  },
  buttonGradient: {
    paddingVertical: 18, 
    alignItems: 'center', 
    justifyContent: 'center',
    height: 60,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 17, 
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  resendContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 10,
  },
  resendText: { 
    color: colors.textSecondary, 
    fontSize: 15 
  },
  timerText: { 
    color: colors.textLight, 
    fontSize: 15, 
    fontWeight: '600' 
  },
  resendLink: { 
    color: colors.primary, 
    fontSize: 15, 
    fontWeight: 'bold' 
  }
});
