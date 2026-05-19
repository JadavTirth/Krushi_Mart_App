import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, ImageBackground, Animated } from 'react-native';

export default function WeatherCard({ weather, scrollY, greetingHeight = 80 }) {
  const { t } = useTranslation();
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    // Detect if current time is between 6 PM (18:00) and 6 AM (06:00)
    const hour = new Date().getHours();
    setIsNight(hour >= 18 || hour < 6);
  }, []);

  const bgImage = isNight
    ? { uri: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' } // Clean starry night sky
    : { uri: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }; // Bright clear blue sky with fluffy clouds

  const primaryTextColor = '#FFFFFF';
  const secondaryTextColor = 'rgba(255, 255, 255, 0.8)';
  const dividerColor = 'rgba(255, 255, 255, 0.2)';

  const weatherIcon = isNight ? '🌙' : '☀️';

  const parallaxTranslateY = scrollY ? scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 50],
    extrapolate: 'clamp',
  }) : 0;

  const secondaryOpacity = scrollY ? scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  }) : 1;

  return (
    <View style={styles.outerWrapper}>
      <Animated.View style={[styles.container, { transform: [{ translateY: parallaxTranslateY }] }]}>
        <ImageBackground 
        source={bgImage} 
        style={styles.container}
        imageStyle={styles.imageBg}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.4)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.glassContainer}>
            <View style={styles.headerRow}>
              <View style={styles.locationInfo}>
                <Text style={styles.emoji}>{weatherIcon}</Text>
                <Text style={[styles.city, { color: primaryTextColor }]} numberOfLines={2}>
                  {weather.city}
                </Text>
              </View>
              <View style={styles.tempContainer}>
                <Text style={[styles.temp, { color: primaryTextColor }]} adjustsFontSizeToFit numberOfLines={1}>
                  {weather.temp}°C
                </Text>
              </View>
            </View>
            <Animated.View style={{ opacity: secondaryOpacity }}>
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{t('weather.humidity')}</Text>
                  <Text style={[styles.detailValue, { color: primaryTextColor }]}>{weather.humidity}%</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>{t('weather.rainChance')}</Text>
                  <Text style={[styles.detailValue, { color: primaryTextColor }]}>{weather.rainChance}%</Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </LinearGradient>
      </ImageBackground>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    width: '100%',
    height: 130, // Reduced from 180 to make it smaller
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    backgroundColor: '#000',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    marginBottom: 8,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    overflow: 'hidden',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  imageBg: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  gradientOverlay: {
    flex: 1,
    padding: 16, // Reduced from 20
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  glassContainer: {
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // Reduced from 12
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  city: {
    fontSize: 18, // Reduced from 20
    fontWeight: '700',
  },
  emoji: {
    fontSize: 24,
  },
  tempContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  temp: {
    fontSize: 32, // Reduced from 40
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginBottom: 8, // Reduced from 12
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  detailItem: {},
  detailLabel: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
