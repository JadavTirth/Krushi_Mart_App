import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../utils/colors';

export default function FloatingButton({ onPress, icon, label, style }) {
  return (
    <TouchableOpacity 
      style={[styles.fabContainer, style]} 
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.fabInner}>
        {icon && <MaterialCommunityIcons name={icon} size={28} color="#FFFFFF" />}
        {label && <Text style={styles.fabText}>{label}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: 36,
    // Premium Shadow
    elevation: 12,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    // Simulating Gradient/3D effect with border
    borderTopWidth: 1,
    borderTopColor: '#66BB6A',
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 36,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});
