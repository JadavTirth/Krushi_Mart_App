import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import colors from '../../src/utils/colors';

export default function OTPScreen() {
  const { phone } = useLocalSearchParams();
  const router = useRouter();
  const { login } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const verifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length === 4) {
      setIsLoading(true);
      // Simulate network request delay
      setTimeout(async () => {
        setIsLoading(false);
        await login('dummy-token-123', { phone });
        // The _layout.tsx will automatically redirect to (tabs) because isLoggedIn becomes true
      }, 1500);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>Enter the 4-digit code sent to +91 {phone}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => inputRefs.current[index] = ref}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleBackspace(e, index)}
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.button, otp.join('').length < 4 && styles.buttonDisabled]} 
          activeOpacity={0.8} 
          onPress={verifyOTP}
          disabled={otp.join('').length < 4 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={() => setTimer(30)}>
              <Text style={styles.resendLink}>Resend Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  backBtn: { padding: 20, paddingTop: 50 },
  header: { paddingHorizontal: 30, marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, lineHeight: 24 },
  form: { flex: 1, paddingHorizontal: 30 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  otpInput: { width: 65, height: 75, backgroundColor: '#FFFFFF', borderRadius: 16, fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: colors.text, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, borderWidth: 1, borderColor: 'transparent' },
  otpInputFilled: { borderColor: colors.primary, backgroundColor: '#F4F8EE' },
  button: { backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, marginBottom: 30 },
  buttonDisabled: { backgroundColor: '#A5D6A7', elevation: 0, shadowOpacity: 0 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  resendContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resendText: { color: colors.textSecondary, fontSize: 16 },
  timerText: { color: colors.textLight, fontSize: 16, fontWeight: '600' },
  resendLink: { color: colors.primary, fontSize: 16, fontWeight: 'bold' }
});
