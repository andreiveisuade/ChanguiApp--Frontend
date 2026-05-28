import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { colors, spacing } from '@/utils/theme';
import { formatARS } from '@/utils/currency';

interface CartItemProps {
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

export function CartItem({ name, price, quantity, imageUrl }: CartItemProps): React.JSX.Element {
  const [imageError, setImageError] = useState(false);
  const showImage = imageUrl && !imageError;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {showImage ? (
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

      <View style={styles.info}>
        <AppText variant="H3" numberOfLines={2}>
          {name}
        </AppText>
        <AppText variant="Body">{formatARS(price)}</AppText>
      </View>

      <View style={styles.quantityBadge}>
        <AppText variant="Label" style={styles.quantityText}>
          {quantity}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 9,
    marginRight: spacing.md,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 48,
    height: 48,
  },
  info: {
    flex: 1,
  },
  quantityBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: colors.textPrimary,
  },
});

export default CartItem;
