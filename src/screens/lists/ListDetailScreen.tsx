import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, iconSize, touchTarget } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import ErrorMessage from '@/components/feedback/ErrorMessage';
import { ListItemRow } from '@/components/lists/ListItemRow';
import { AddListItemInput } from '@/components/lists/AddListItemInput';
import { useListDetail } from '@/viewmodels/useListDetail';

export function ListDetailScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; name?: string }>();
  const { items, isLoading, error, refresh, addItem, toggleItem, removeList } = useListDetail(
    params.id
  );

  const handleDelete = async (): Promise<void> => {
    const ok = await removeList();
    if (ok) router.back();
  };

  const renderBody = (): React.JSX.Element => {
    if (error) {
      return (
        <View style={styles.stateContainer}>
          <ErrorMessage message={error} closeAccessibilityHint={t('common.retry')} onClose={refresh} />
        </View>
      );
    }
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
          <AppText variant="Body" style={styles.empty}>
            {t('lists.detailEmpty')}
          </AppText>
        </View>
      );
    }
    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.itemsCard}>
          {items.map((item, index) => (
            <ListItemRow
              key={item.id}
              item={item}
              onToggle={() => toggleItem(item)}
              isLast={index === items.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.page}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.headerBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={t('lists.back')}
          >
            <AppIcon name="atras" size={iconSize.md} color={colors.textPrimary} />
          </Pressable>
          <AppText variant="H2" style={styles.headerTitle} numberOfLines={1}>
            {params.name || t('lists.title')}
          </AppText>
          <Pressable
            onPress={handleDelete}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={t('lists.deleteList')}
          >
            <AppIcon name="eliminar" size={iconSize.md} color={colors.error} />
          </Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.addRow}>
        <AddListItemInput onAdd={addItem} />
      </View>

      {renderBody()}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    flex: 1,
  },
  headerSafe: {
    backgroundColor: colors.white,
  },
  headerBar: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: spacing.sm,
    textTransform: 'none',
  },
  addRow: {
    padding: spacing.lg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  itemsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
  },
  stateContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  empty: {
    textAlign: 'center',
  },
});

export default ListDetailScreen;
