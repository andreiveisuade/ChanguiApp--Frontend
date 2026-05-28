import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Product } from '@/types/domain';
import { colors, radii, spacing } from '@/utils/theme';
import { AppText } from '@/components/atoms/AppText';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { formatARS } from '@/utils/currency';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  isLoading?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  isLoading = false,
}: ProductCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  return (
    <View style={styles.card}>
      {product.image_url && !imageError ? (
        <Image
          source={{ uri: product.image_url }}
          style={styles.image}
          onError={() => setImageError(true)}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={product.name}
        />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}

      <View style={styles.info}>
        <AppText variant="H2" numberOfLines={2}>{product.name}</AppText>
        {product.brand ? (
          <AppText variant="Body">{product.brand}</AppText>
        ) : null}
        <AppText variant="Price" style={styles.price}>{formatARS(product.price)}</AppText>
      </View>

      <PrimaryButton
        title={t('scanner.addToCart')}
        accessibilityHint={t('scanner.addToCart')}
        onPress={onAddToCart}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: radii.md,
    backgroundColor: colors.muted,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: radii.md,
    backgroundColor: colors.muted,
  },
  info: {
    gap: spacing.xs,
  },
  price: {
    marginTop: spacing.xs,
  },
});

export default ProductCard;
