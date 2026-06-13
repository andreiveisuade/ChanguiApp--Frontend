import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { QuantitySelector } from '@/components/buttons/QuantitySelector';
import { colors, iconSize, radii, spacing } from '@/constants/theme';
import { formatARS } from '@/utils/currency';

interface CartItemProps {
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  onUpdateQuantity: (quantity: number) => void;
  onDelete: () => void;
}

export function CartItem({
  name,
  price,
  quantity,
  imageUrl,
  onUpdateQuantity,
  onDelete,
}: CartItemProps): React.JSX.Element {
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
          <AppIcon name="package" size={iconSize.lgl} color={colors.textSecondary} />
        )}
      </View>

      <View style={styles.info}>
        <AppText variant="H3" numberOfLines={2} style={styles.name}>
          {name}
        </AppText>
        <AppText variant="Body" style={styles.price}>
          {formatARS(price)}
        </AppText>
      </View>

      <View style={styles.actionsContainer}>
        <QuantitySelector
          value={quantity}
          onIncrement={() => onUpdateQuantity(quantity + 1)}
          onDecrement={() => onUpdateQuantity(quantity - 1)}
          min={1}
        />

        <Pressable
          onPress={onDelete}
          style={styles.deleteButton}
          accessibilityRole="button"
          accessibilityLabel="Eliminar producto del carrito"
        >
          <AppIcon name="eliminar" size={iconSize.mdl} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    marginRight: spacing.md,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 60,
    height: 60,
  },
  info: {
    flex: 1,
    paddingRight: spacing.sm,
    justifyContent: 'center',
  },
  name: {
    textTransform: 'none',
  },
  price: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  deleteButton: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CartItem;
