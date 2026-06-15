import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  borderWidth,
  colors,
  iconSize,
  opacity,
  radii,
  sizes,
  spacing,
  touchTarget,
} from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { ProductSearchInput } from '@/components/lists/ProductSearchInput';
import { ListItemRow } from '@/components/lists/ListItemRow';
import { useListDetail } from '@/viewmodels/useListDetail';

export function ListDetailScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ listId: string; name?: string }>();
  const { items, isLoading, addProduct, toggleItem, removeItem } = useListDetail(params.listId);

  const title = params.name ?? t('lists.title');

  const renderBody = (): React.JSX.Element => {
    if (isLoading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      );
    }
    if (items.length === 0) {
      return (
        <View style={styles.stateContainer}>
          <AppIcon name="lista" size={iconSize.hero} color={colors.border} />
          <AppText variant="H3" style={styles.emptyTitle}>
            {t('lists.emptyListTitle')}
          </AppText>
          <AppText variant="Body" style={styles.emptySubtitle}>
            {t('lists.emptyListSubtitle')}
          </AppText>
        </View>
      );
    }
    return (
      <View style={styles.itemsCard}>
        {items.map((item, index) => (
          <ListItemRow
            key={item.id}
            item={item}
            onToggle={() => toggleItem(item.id)}
            onDelete={() => removeItem(item.id)}
            isLast={index === items.length - 1}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.page}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.headerBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel={t('lists.back')}
          >
            <AppIcon name="atras" size={iconSize.md} color={colors.textPrimary} />
          </Pressable>
          <AppText variant="H2" style={styles.headerTitle} numberOfLines={1}>
            {title}
          </AppText>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProductSearchInput onSelect={addProduct} />
        {renderBody()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    flex: 1,
  },
  headerSafe: {
    backgroundColor: colors.white,
  },
  headerBar: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: borderWidth.hairline,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
  },
  headerTitle: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  itemsCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: borderWidth.hairline,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  stateContainer: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: sizes.emptyStateOffset,
    padding: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.sm,
    textAlign: 'center',
    textTransform: 'none',
  },
  emptySubtitle: {
    opacity: opacity.muted,
    textAlign: 'center',
  },
});

export default ListDetailScreen;
