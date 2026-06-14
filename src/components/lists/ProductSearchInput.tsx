import React from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Product } from '@/types/domain';
import { colors, radii, spacing, touchTarget } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { SearchBar } from '@/components/forms/SearchBar';
import { formatARS } from '@/utils/currency';
import { useProductSearch } from '@/viewmodels/useProductSearch';

const MIN_CHARS = 2;

interface ProductSearchInputProps {
  onSelect: (product: Product) => void;
}

/**
 * Buscador de productos del catálogo local para agregar a una lista. Solo se
 * puede agregar tocando un resultado real: no hay forma de ingresar texto libre.
 */
export function ProductSearchInput({ onSelect }: ProductSearchInputProps): React.JSX.Element {
  const { t } = useTranslation();
  const { query, setQuery, results, isLoading } = useProductSearch({ minChars: MIN_CHARS });

  const handleSelect = (product: Product) => {
    onSelect(product);
    setQuery('');
    Keyboard.dismiss();
  };

  const showEmpty = query.trim().length >= MIN_CHARS && !isLoading && results.length === 0;

  return (
    <View>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t('lists.searchPlaceholder')}
        accessibilityLabel={t('lists.searchPlaceholder')}
      />

      {results.length > 0 ? (
        <View style={styles.dropdown}>
          <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {results.map((product, index) => (
              <Pressable
                key={product.barcode}
                onPress={() => handleSelect(product)}
                accessibilityRole="button"
                accessibilityLabel={product.name}
                style={({ pressed }) => [
                  styles.row,
                  index === results.length - 1 && styles.rowLast,
                  pressed && styles.rowPressed,
                ]}
              >
                <View style={styles.info}>
                  <AppText variant="Body" style={styles.name} numberOfLines={1}>
                    {product.name}
                  </AppText>
                  {product.brand ? (
                    <AppText variant="Label" style={styles.brand} numberOfLines={1}>
                      {product.brand}
                    </AppText>
                  ) : null}
                </View>
                <AppText variant="Price">{formatARS(product.price)}</AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {showEmpty ? (
        <View style={styles.empty}>
          <AppText variant="Body" style={styles.emptyText}>
            {t('lists.noResults')}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    elevation: 2,
    maxHeight: 260,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: touchTarget.minHeight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowPressed: {
    opacity: 0.7,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    textTransform: 'none',
  },
  brand: {
    color: colors.textSecondary,
    textTransform: 'none',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
  },
});

export default ProductSearchInput;
