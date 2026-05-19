import React from 'react';
import { Text, StyleSheet } from 'react-native';
import colors from '../../utils/colors';

export default function SectionTitle({ title, style }) {
  return (
    <Text style={[styles.title, style]}>{title}</Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});
