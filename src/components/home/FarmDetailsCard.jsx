import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../utils/colors';

export default function FarmDetailsCard({ details }) {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {details.image ? (
          <Image source={{ uri: details.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialCommunityIcons name="image" size={40} color={colors.primaryLight} />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.cropName}>{details.cropName} Farm</Text>
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="ruler-square" size={16} color={colors.textSecondary} style={styles.icon} />
          <Text style={styles.detailText}>{details.area || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="land-plots" size={16} color={colors.textSecondary} style={styles.icon} />
          <Text style={styles.detailText}>{details.soilType || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="water-pump" size={16} color={colors.textSecondary} style={styles.icon} />
          <Text style={styles.detailText}>{details.waterSource || 'N/A'}</Text>
        </View>

        {details.description ? (
          <Text style={styles.description} numberOfLines={2}>{details.description}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  imageContainer: {
    width: 110,
    height: 130, // Fixed height to match right side content roughly
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F8F1', // light green fallback
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cropName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
