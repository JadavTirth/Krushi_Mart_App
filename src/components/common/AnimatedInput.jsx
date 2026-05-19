import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import colors from '../../utils/colors';

export default function AnimatedInput({
  value,
  onChangeText,
  placeholder,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColorValue = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    borderColorValue.value = withTiming(1, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderColorValue.value = withTiming(0, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: borderColorValue.value === 1 ? colors.primary : colors.divider,
      borderWidth: borderColorValue.value === 1 ? 2 : 1,
      shadowOpacity: withTiming(borderColorValue.value === 1 ? 0.15 : 0.05),
      shadowRadius: withTiming(borderColorValue.value === 1 ? 6 : 2),
      elevation: withTiming(borderColorValue.value === 1 ? 4 : 2),
    };
  });

  return (
    <Animated.View style={[styles.inputContainer, animatedBorderStyle, style]}>
      {leftIcon && (
        <MaterialCommunityIcons 
          name={leftIcon} 
          size={20} 
          color={isFocused ? colors.primary : colors.textSecondary} 
          style={styles.leftIcon}
        />
      )}
      
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      
      {rightIcon && (
        <MaterialCommunityIcons 
          name={rightIcon} 
          size={20} 
          color={colors.textSecondary} 
          style={styles.rightIcon}
          onPress={onRightIconPress}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
});
