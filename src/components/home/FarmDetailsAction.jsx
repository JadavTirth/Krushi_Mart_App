import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../utils/colors';

export default function FarmDetailsAction({ onPress, isUpdate }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.iconContainer, isUpdate && { backgroundColor: '#EF6C00' }]}>
        <MaterialCommunityIcons name={isUpdate ? "pencil" : "plus"} size={isUpdate ? 36 : 44} color="#FFFFFF" />
      </View>
      <View style={styles.textContainer}>  
        <Text style={styles.title}>{isUpdate ? "Update your details" : "Share your farm details"}</Text>
        <Text style={styles.subtitle}>{isUpdate ? "Edit crop & land info" : "Add crop & land info"}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 14, // Rectangle with slight rounded corners
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
