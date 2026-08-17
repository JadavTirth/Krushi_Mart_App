import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator,
  Image
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function ImageZoomModal({ visible, imageUrl, onClose }) {
  const [loading, setLoading] = useState(true);

  const scale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  const savedScale = useSharedValue(1);
  const savedTranslationX = useSharedValue(0);
  const savedTranslationY = useSharedValue(0);

  // Reset values when modal visibility changes
  useEffect(() => {
    if (visible) {
      setLoading(true);
    } else {
      scale.value = 1;
      translationX.value = 0;
      translationY.value = 0;
      savedScale.value = 1;
      savedTranslationX.value = 0;
      savedTranslationY.value = 0;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Pinch Gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(1, savedScale.value * event.scale);
    })
    .onEnd(() => {
      if (scale.value > 4) {
        scale.value = withTiming(4);
        savedScale.value = 4;
      } else {
        savedScale.value = scale.value;
      }
    });

  // Pan Gesture (only active when zoomed)
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        translationX.value = savedTranslationX.value + event.translationX;
        translationY.value = savedTranslationY.value + event.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value > 1) {
        // Bound the panning translation slightly so it doesn't disappear completely
        const maxTranslationX = (screenWidth * (scale.value - 1)) / 2;
        const maxTranslationY = (screenHeight * (scale.value - 1)) / 2;

        let targetX = translationX.value;
        let targetY = translationY.value;

        if (translationX.value > maxTranslationX) targetX = maxTranslationX;
        if (translationX.value < -maxTranslationX) targetX = -maxTranslationX;
        if (translationY.value > maxTranslationY) targetY = maxTranslationY;
        if (translationY.value < -maxTranslationY) targetY = -maxTranslationY;

        translationX.value = withTiming(targetX);
        translationY.value = withTiming(targetY);
        savedTranslationX.value = targetX;
        savedTranslationY.value = targetY;
      } else {
        translationX.value = withTiming(0);
        translationY.value = withTiming(0);
        savedTranslationX.value = 0;
        savedTranslationY.value = 0;
      }
    });

  // Double Tap Gesture to Zoom In/Out
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        translationX.value = withTiming(0);
        translationY.value = withTiming(0);
        savedScale.value = 1;
        savedTranslationX.value = 0;
        savedTranslationY.value = 0;
      } else {
        scale.value = withTiming(2.5);
        savedScale.value = 2.5;
      }
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translationX.value },
        { translateY: translationY.value },
        { scale: scale.value }
      ]
    };
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.rootContainer}>
        <View style={styles.modalBackground}>
          {/* Close button with high zIndex */}
          <TouchableOpacity 
            style={styles.closeButton} 
            activeOpacity={0.7} 
            onPress={onClose}
          >
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Loader */}
          {loading && (
            <ActivityIndicator 
              size="large" 
              color="#FFFFFF" 
              style={styles.loader} 
            />
          )}

          {/* Image Container with Composed Gestures */}
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={styles.imageWrapper}>
              <AnimatedImage
                source={{ uri: imageUrl }}
                style={[styles.fullImage, animatedStyle]}
                onLoadEnd={() => setLoading(false)}
              />
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  imageWrapper: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: screenWidth,
    height: '100%',
    resizeMode: 'contain',
  },
  loader: {
    position: 'absolute',
    zIndex: 99,
  },
});
