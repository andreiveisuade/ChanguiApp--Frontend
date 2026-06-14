import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { colors, fonts, radii, spacing, touchTarget } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { ShoppingListCard } from '@/components/lists/ShoppingListCard';
import { useLists } from '@/viewmodels/useLists';
import { ROUTES } from '@/constants/routes';
import { ShoppingList } from '@/types/domain';

export function ListsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const { lists, isLoading, createList, deleteList } = useLists();
  const [name, setName] = useState('');

  const handleCreate = (): void => {
    const trimmed = name.trim();
    if (!trimmed) return;
    void createList(trimmed);
    setName('');
  };

  const goToDetail = (list: ShoppingList): void => {
    router.push({ pathname: ROUTES.listDetail, params: { listId: list.id, name: list.name } });
  };

  const confirmDelete = (list: ShoppingList): void => {
    Alert.alert(t('lists.deleteList'), t('lists.deleteListConfirm', { name: list.name }), [
      { text: t('lists.cancel'), style: 'cancel' },
      { text: t('lists.delete'), style: 'destructive', onPress: () => void deleteList(list.id) },
    ]);
  };

  const renderEmpty = (): React.JSX.Element | null => {
    if (isLoading) return null;
    return (
      <View style={styles.stateContainer}>
        <AppIcon name="lista" size={48} color={colors.border} />
        <AppText variant="H3" style={styles.emptyTitle}>{t('lists.emptyTitle')}</AppText>
        <AppText variant="Body" style={styles.emptySubtitle}>{t('lists.emptySubtitle')}</AppText>
      </View>
    );
  };

  const canCreate = name.trim().length > 0;

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
            <AppIcon name="atras" size={22} color={colors.textPrimary} />
          </Pressable>
          <AppText variant="H2" style={styles.headerTitle}>{t('lists.title')}</AppText>
        </View>
      </SafeAreaView>

      <View style={styles.createRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('lists.listNamePlaceholder')}
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={handleCreate}
          accessibilityLabel={t('lists.newList')}
        />
        <Pressable
          onPress={handleCreate}
          disabled={!canCreate}
          accessibilityLabel={t('lists.createList')}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.addButton,
            !canCreate && styles.addButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <AppIcon name="mas" size={22} color={colors.white} />
        </Pressable>
      </View>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ShoppingListCard
            list={item}
            onPress={() => goToDetail(item)}
            onLongPress={() => confirmDelete(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmpty}
      />
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
    borderBottomWidth: 1,
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
  createRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: radii.md,
    color: colors.textPrimary,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: 48,
    justifyContent: 'center',
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
    width: 48,
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  separator: {
    height: spacing.md,
  },
  stateContainer: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: 60,
    padding: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.sm,
    textAlign: 'center',
    textTransform: 'none',
  },
  emptySubtitle: {
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default ListsScreen;
