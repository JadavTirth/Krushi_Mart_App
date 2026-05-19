import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../utils/colors';

const { width } = Dimensions.get('window');

export default function MedicineCard({ medicine, onPress }) {
  const [imageError, setImageError] = useState(false);

  // Fallback images if medicine doesn't have one
  const imageMap = {
    'Fertilizer': 'https://images.unsplash.com/photo-1627989580309-bfaf3e58af6f?w=500&q=80',
    'Fungicide': 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500&q=80',
    'Pesticide': 'https://images.unsplash.com/photo-1563241527-3004b7be0bfb?w=500&q=80',
  };
  
  const imageUrl = medicine.image || imageMap[medicine.category] || 'https://images.unsplash.com/photo-1592982537444-d30f40f090b8?w=500&q=80';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      {imageError ? (
        <View style={styles.fallbackImageContainer}>
          <MaterialCommunityIcons name="flask-outline" size={40} color={colors.primary} />
          <Text style={styles.fallbackImageText}>No Image</Text>
        </View>
      ) : (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image} 
          onError={() => setImageError(true)}
        />
      )}
      
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>{medicine.name}</Text>
        <Text style={styles.use} numberOfLines={1}>{medicine.use}</Text>
        <Text style={styles.price}>{medicine.price}</Text>
      </View>

      <TouchableOpacity style={styles.buyButton} onPress={onPress}>
        <Text style={styles.buyText}>Buy</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    resizeMode: 'cover',
  },
  fallbackImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#E8F5E9', // Light green background
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackImageText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    height: 40, // fix height for alignment
  },
  use: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  buyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  buyText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
