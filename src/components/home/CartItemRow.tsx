import React, { useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CartItemWithProduct } from '@/types/domain';
import { colors, spacing, iconSize } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { formatARS } from '@/utils/currency';

interface CartItemRowProps {
  item: CartItemWithProduct;
  isLast?: boolean;
}

export const CartItemRow = ({ item, isLast = false }: CartItemRowProps) => {
  const { t } = useTranslation();
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
          <AppIcon name="package" size={iconSize.mdl} color={colors.textSecondary} />
        )}
      </View>

      <View style={styles.detailsContainer}>
        <AppText variant="H3" style={styles.productName} numberOfLines={2}>
          {item.product?.name || t('home.fallbackProductName')}
        </AppText>
        <AppText variant="Body">{formatARS(itemTotal)}</AppText>
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
    borderBottomColor: colors.border,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.muted,
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
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
});

export default CartItemRow;
