import React, { useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CartItemWithProduct } from '@/types/domain';
import { colors, fonts, spacing } from '@/utils/theme';
import { AppText } from '@/components/atoms/AppText';

interface CartItemRowProps {
  item: CartItemWithProduct;
  isLast?: boolean;
}

export const CartItemRow = ({ item, isLast = false }: CartItemRowProps) => {
  const [imageError, setImageError] = useState(false);

  // Manual currency formatter for ARS to prevent formatting variations across environments
  const formatCurrency = (value: number) => {
    const formatted = Math.round(value)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${formatted}`;
  };

  const itemTotal = item.unit_price * item.quantity;
  const imageUrl = item.product?.image_url;

  return (
    <View style={[styles.row, isLast && styles.noBorder]}>
      <View style={styles.imageContainer}>
        {imageUrl && !imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        ) : (
          <Feather name="package" size={24} color="#666666" />
        )}
      </View>

      <View style={styles.detailsContainer}>
        <AppText variant="H3" style={styles.productName} numberOfLines={2}>
          {item.product?.name || 'Producto'}
        </AppText>
        <AppText variant="Body" style={styles.productPrice}>
          {formatCurrency(itemTotal)}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Subtle light gray separator
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3F4F6', // Light gray backdrop for placeholder
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  image: {
    width: 56,
    height: 56,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontFamily: fonts.body, // Inter
    fontSize: 15,
    color: '#000000', // textPrimary
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#666666', // textSecondary
  },
});

export default CartItemRow;
