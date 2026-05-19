import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import colors from '../../utils/colors';

export default function CustomButton({ 
  title, 
  onPress, 
  variant = 'primary', // 'primary', 'secondary', 'outline'
  style, 
  textStyle,
  loading = false,
  disabled = false
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.divider;
    if (variant === 'secondary') return colors.surfaceCard;
    if (variant === 'outline') return 'transparent';
    return colors.primary;
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    if (variant === 'outline' || variant === 'secondary') return colors.primary;
    return '#FFFFFF';
  };

  const getBorderColor = () => {
    if (disabled) return colors.divider;
    if (variant === 'outline') return colors.primary;
    return 'transparent';
  };

  return (
    <Animated.View style={[styles.buttonWrapper, style, animatedStyle]}>
      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: variant === 'outline' ? 1 : 0,
          }
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    width: '100%',
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
  },
});
