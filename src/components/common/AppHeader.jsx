import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../utils/colors';

export default function AppHeader({ title, onBack, rightIcon, onRightPress }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity style={styles.iconButton} onPress={onBack} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      
      <Text style={styles.title}>{title}</Text>
      
      {rightIcon ? (
        <TouchableOpacity style={styles.iconButton} onPress={onRightPress} activeOpacity={0.7}>
          <MaterialCommunityIcons name={rightIcon} size={28} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  iconButton: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  spacer: {
    width: 48,
  },
});
