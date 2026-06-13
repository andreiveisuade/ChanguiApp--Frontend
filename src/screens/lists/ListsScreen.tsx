import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { colors, spacing, iconSize, touchTarget } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import ErrorMessage from '@/components/feedback/ErrorMessage';
import { ShoppingListCard } from '@/components/lists/ShoppingListCard';
import { AddListItemInput } from '@/components/lists/AddListItemInput';
import { useLists } from '@/viewmodels/useLists';
import { ShoppingList } from '@/types/domain';
import { ROUTES } from '@/constants/routes';

export function ListsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const { lists, isLoading, error, refresh, createList } = useLists();

  const openList = (list: ShoppingList): void => {
    router.push({ pathname: ROUTES.listDetail, params: { id: list.id, name: list.name } });
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
    if (lists.length === 0) {
      return (
        <View style={styles.stateContainer}>
          <AppText variant="Body" style={styles.empty}>
            {t('lists.empty')}
          </AppText>
        </View>
      );
    }
    return (
      <FlatList
        data={lists}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <ShoppingListCard list={item} onPress={() => openList(item)} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
          <AppText variant="H2" style={styles.headerTitle}>
            {t('lists.title')}
          </AppText>
        </View>
      </SafeAreaView>

      <View style={styles.createRow}>
        <AddListItemInput onAdd={createList} placeholder={t('lists.newListPlaceholder')} />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
  },
  headerTitle: {
    marginLeft: spacing.sm,
  },
  createRow: {
    padding: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: spacing.md,
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

export default ListsScreen;
