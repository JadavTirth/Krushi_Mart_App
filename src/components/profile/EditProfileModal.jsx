import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import colors from '../../utils/colors';

export default function EditProfileModal({ visible, onClose, user, onSave }) {
  const { t } = useTranslation();

  // Local state for form
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    village: user?.village || '',
    district: user?.district || '',
    state: user?.state || '',
    farmSize: user?.farmSize || '',
    primaryCrops: user?.primaryCrops || '',
    currentCrops: user?.currentCrops || '',
    medicinesUsed: user?.medicinesUsed || '',
    bio: user?.bio || '',
  });

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onSave) onSave(formData);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton} activeOpacity={0.7}>
            <MaterialCommunityIcons name="close" size={32} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton} activeOpacity={0.7}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Privacy Notice */}
            <View style={styles.privacyNotice}>
              <MaterialCommunityIcons name="shield-check" size={24} color={colors.primary} />
              <Text style={styles.privacyText}>
                Your phone number and email are private and will not be displayed on your public profile.
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(val) => handleChange('name', val)}
                placeholder="Enter your name"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(val) => handleChange('phone', val)}
                placeholder="e.g. +91 98765 43210"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(val) => handleChange('email', val)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Village</Text>
              <TextInput
                style={styles.input}
                value={formData.village}
                onChangeText={(val) => handleChange('village', val)}
                placeholder="e.g. Bardoli"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>District</Text>
              <TextInput
                style={styles.input}
                value={formData.district}
                onChangeText={(val) => handleChange('district', val)}
                placeholder="e.g. Surat"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(val) => handleChange('state', val)}
                placeholder="e.g. Gujarat"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Size of Your Farm</Text>
              <TextInput
                style={styles.input}
                value={formData.farmSize}
                onChangeText={(val) => handleChange('farmSize', val)}
                placeholder="e.g. 5 Acres"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Primary Crops Grown</Text>
              <TextInput
                style={styles.input}
                value={formData.primaryCrops}
                onChangeText={(val) => handleChange('primaryCrops', val)}
                placeholder="e.g. Wheat, Cotton, Sugarcane"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Currently Cultivating</Text>
              <TextInput
                style={styles.input}
                value={formData.currentCrops}
                onChangeText={(val) => handleChange('currentCrops', val)}
                placeholder="e.g. Tomatoes and Onions"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fertilizers & Medicines Used</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.medicinesUsed}
                onChangeText={(val) => handleChange('medicinesUsed', val)}
                placeholder="e.g. Urea, DAP, Organic Pesticides"
                placeholderTextColor={colors.textLight}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Bio / About Me</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(val) => handleChange('bio', val)}
                placeholder="Tell the community a little bit about yourself..."
                placeholderTextColor={colors.textLight}
                multiline
                textAlignVertical="top"
              />
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    zIndex: 10,
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  privacyNotice: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: colors.text,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
});
