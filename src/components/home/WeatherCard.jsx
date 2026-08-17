import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../utils/colors';

export default function WeatherCard({ weather, scrollY }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Tab switching animations (opacity and translation)
  const tabContentOpacity = useRef(new Animated.Value(1)).current;
  const tabContentTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!scrollY) return;
    const listenerId = scrollY.addListener(({ value }) => {
      const collapsed = value > 80;
      if (collapsed !== isCollapsed) {
        setIsCollapsed(collapsed);
      }
    });
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [scrollY, isCollapsed]);

  const switchTab = (index) => {
    if (index === activeTab) return;

    // Fade out and translate left
    Animated.parallel([
      Animated.timing(tabContentOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(tabContentTranslateX, {
        toValue: -15,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(index);
      // Reset translation position to right side
      tabContentTranslateX.setValue(15);
      // Fade in and translate to center
      Animated.parallel([
        Animated.timing(tabContentOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(tabContentTranslateX, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Scroll animations for 3D Perspective Tilt and Scale
  const parallaxTranslateY = scrollY ? scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 40],
    extrapolate: 'clamp',
  }) : 0;

  const rotateX = scrollY ? scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: ['0deg', '-15deg'],
    extrapolate: 'clamp',
  }) : '0deg';

  const scale = scrollY ? scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.94],
    extrapolate: 'clamp',
  }) : 1;

  // Fading detail views out and collapsing to simple summary ticker
  const mainContentOpacity = scrollY ? scrollY.interpolate({
    inputRange: [30, 90],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  }) : 1;

  const compactContentOpacity = scrollY ? scrollY.interpolate({
    inputRange: [70, 130],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  }) : 0;

  const renderCurrentWeather = () => (
    <View style={styles.statsContainer}>
      <View style={styles.weatherStatCard}>
        <View style={styles.statHeader}>
          <MaterialCommunityIcons name="thermometer" size={18} color={colors.accent} />
          <Text style={styles.statLabel}>Temperature</Text>
        </View>
        <Text style={styles.statValue}>{weather.temp}°C</Text>
        <Text style={styles.statSubText}>{weather.condition || 'Clear'} Sky</Text>
      </View>

      <View style={styles.weatherStatCard}>
        <View style={styles.statHeader}>
          <MaterialCommunityIcons name="water-percent" size={18} color="#4FC3F7" />
          <Text style={styles.statLabel}>{t('weather.humidity')}</Text>
        </View>
        <Text style={styles.statValue}>{weather.humidity}%</Text>
        <Text style={styles.statSubText}>Moisture Index</Text>
      </View>

      <View style={styles.weatherStatCard}>
        <View style={styles.statHeader}>
          <MaterialCommunityIcons name="weather-rainy" size={18} color="#90CAF9" />
          <Text style={styles.statLabel}>{t('weather.rainChance')}</Text>
        </View>
        <Text style={styles.statValue}>{weather.rainChance}%</Text>
        <Text style={styles.statSubText}>Probability</Text>
      </View>
    </View>
  );

  const renderForecast = () => (
    <View style={styles.forecastContainer}>
      <View style={styles.forecastDayCard}>
        <Text style={styles.forecastDay}>Tomorrow</Text>
        <MaterialCommunityIcons name="weather-partly-cloudy" size={20} color="#E0F2F1" />
        <Text style={styles.forecastTemp}>33° / 24°</Text>
      </View>

      <View style={styles.forecastDayCard}>
        <Text style={styles.forecastDay}>Tue</Text>
        <MaterialCommunityIcons name="weather-sunny" size={20} color={colors.accent} />
        <Text style={styles.forecastTemp}>34° / 25°</Text>
      </View>

      <View style={styles.forecastDayCard}>
        <Text style={styles.forecastDay}>Wed</Text>
        <MaterialCommunityIcons name="weather-rainy" size={20} color="#4FC3F7" />
        <Text style={styles.forecastTemp}>31° / 23°</Text>
      </View>

      <View style={styles.forecastDayCard}>
        <Text style={styles.forecastDay}>Thu</Text>
        <MaterialCommunityIcons name="weather-cloudy" size={20} color="#B0BEC5" />
        <Text style={styles.forecastTemp}>32° / 24°</Text>
      </View>
    </View>
  );

  const renderWeatherAdvisory = () => (
    <View style={styles.advisoryCard}>
      <View style={styles.advisoryHeader}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color={colors.accent} />
        <Text style={styles.advisoryTitle}>Weather Advisory for Farmers</Text>
      </View>
      <Text style={styles.advisoryBody} numberOfLines={2}>
        Low rain probability. Ideal for harvesting cotton. Avoid pesticide sprays if wind gusts exceed 15 km/h.
      </Text>
    </View>
  );

  return (
    <View style={styles.outerWrapper}>
      <Animated.View
        style={[
          styles.perspectiveWrapper,
          {
            transform: [
              { perspective: 1000 },
              { translateY: parallaxTranslateY },
              { rotateX: rotateX },
              { scale: scale }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={[colors.primaryDark, '#0B3C11']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBackground}
        >
          {/* A. Detailed Insights View (Fades out when scrolling) */}
          <Animated.View style={[styles.mainView, { opacity: mainContentOpacity }]}>
            {/* Header Tabs */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                onPress={() => switchTab(0)}
                style={[styles.tabBtn, activeTab === 0 && styles.tabBtnActive]}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="weather-cloudy" size={16} color={activeTab === 0 ? colors.primaryDark : '#A5D6A7'} />
                <Text style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}>Current</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => switchTab(1)}
                style={[styles.tabBtn, activeTab === 1 && styles.tabBtnActive]}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="calendar-range" size={16} color={activeTab === 1 ? colors.primaryDark : '#A5D6A7'} />
                <Text style={[styles.tabText, activeTab === 1 && styles.tabTextActive]}>Forecast</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => switchTab(2)}
                style={[styles.tabBtn, activeTab === 2 && styles.tabBtnActive]}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="flower-tulip-outline" size={16} color={activeTab === 2 ? colors.primaryDark : '#A5D6A7'} />
                <Text style={[styles.tabText, activeTab === 2 && styles.tabTextActive]}>Agri-Tip</Text>
              </TouchableOpacity>
            </View>

            {/* Inner Dashboard Content */}
            <Animated.View 
              style={[
                styles.contentArea, 
                { 
                  opacity: tabContentOpacity,
                  transform: [{ translateX: tabContentTranslateX }]
                }
              ]}
            >
              {activeTab === 0 && renderCurrentWeather()}
              {activeTab === 1 && renderForecast()}
              {activeTab === 2 && renderWeatherAdvisory()}
            </Animated.View>
          </Animated.View>

          {/* B. Sleek Collapsed Summary Ticker (Fades in when scrolling down) */}
          <Animated.View 
            pointerEvents={isCollapsed ? 'auto' : 'none'} 
            style={[styles.compactView, { opacity: compactContentOpacity }]}
          >
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.compactScrollView}
            >
              <View style={styles.compactItem}>
                <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.accent} />
                <Text style={styles.compactText}>{weather.city || 'Ahmedabad'}</Text>
              </View>
              <View style={styles.compactDivider} />

              <View style={styles.compactItem}>
                <MaterialCommunityIcons name="thermometer" size={14} color="#FFF" />
                <Text style={styles.compactText}>{weather.temp}°C</Text>
              </View>
              <View style={styles.compactDivider} />

              <View style={styles.compactItem}>
                <MaterialCommunityIcons name="water-percent" size={14} color="#4FC3F7" />
                <Text style={styles.compactText}>Moisture: {weather.humidity}%</Text>
              </View>
              <View style={styles.compactDivider} />

              <View style={styles.compactItem}>
                <MaterialCommunityIcons name="weather-rainy" size={14} color="#AED581" />
                <Text style={styles.compactText}>Rain: {weather.rainChance}%</Text>
              </View>
            </ScrollView>
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  perspectiveWrapper: {
    height: 155,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardBackground: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  mainView: {
    flex: 1,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 12,
    padding: 3,
    gap: 4,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 5,
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A5D6A7',
  },
  tabTextActive: {
    color: colors.primaryDark,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
  },
  // 1. Current Weather Styles
  statsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  weatherStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '500',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 0,
  },
  statSubText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8,
    fontWeight: '600',
  },
  // 2. Forecast Weather Styles
  forecastContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  forecastDayCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  forecastDay: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 4,
  },
  forecastTemp: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '750',
    marginTop: 4,
  },
  // 3. Advisory Weather Styles
  advisoryCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  advisoryTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '750',
  },
  advisoryBody: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    lineHeight: 13,
  },
  // B. Compact View Ticker
  compactView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  compactScrollView: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  compactText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  compactDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
