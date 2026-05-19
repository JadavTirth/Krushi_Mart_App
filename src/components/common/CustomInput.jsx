import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../utils/colors';

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  style,
  ...props
}) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        error ? styles.inputContainerError : null
      ]}>
        {leftIcon && (
          <MaterialCommunityIcons 
            name={leftIcon} 
            size={24} 
            color={colors.textSecondary} 
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          {...props}
        />
        
        {rightIcon && (
          <MaterialCommunityIcons 
            name={rightIcon} 
            size={24} 
            color={colors.textSecondary} 
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: colors.text,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
