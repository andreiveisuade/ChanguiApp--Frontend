import React, { useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { CartItemWithProduct } from '@/types/domain';
import { colors, fonts, spacing } from '@/utils/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { formatARS } from '@/utils/currency';

interface CartItemRowProps {
  item: CartItemWithProduct;
  isLast?: boolean;
}

export const CartItemRow = ({ item, isLast = false }: CartItemRowProps) => {
  const [imageError, setImageError] = useState(false);

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
          <AppIcon name="package" size={24} color={colors.textSecondary} />
        )}
      </View>

      <View style={styles.detailsContainer}>
        <AppText variant="H3" style={styles.productName} numberOfLines={2}>
          {item.product?.name || 'Producto'}
        </AppText>
        <AppText variant="Body" style={styles.productPrice}>
          {formatARS(itemTotal)}
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
