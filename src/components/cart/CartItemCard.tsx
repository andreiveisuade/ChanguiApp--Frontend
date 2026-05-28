import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CartItemWithProduct } from '@/types/domain';
import { colors, spacing } from '@/utils/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { formatARS } from '@/utils/currency';

interface CartItemCardProps {
  item: CartItemWithProduct;
  isLast?: boolean;
}

export function CartItemCard({
  item,
  isLast = false,
}: CartItemCardProps): React.JSX.Element {
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
          <AppIcon name="package" size={24} color={colors.textSecondary} />
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
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: colors.muted,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
    width: 56,
  },
  image: {
    height: 56,
    width: 56,
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

export default CartItemCard;
