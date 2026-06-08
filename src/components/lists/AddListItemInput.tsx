import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, radii, spacing, touchTarget } from '@/constants/theme';
import { AppIcon } from '@/components/atoms/AppIcon';

interface AddListItemInputProps {
  onAdd: (name: string) => void;
}

export function AddListItemInput({ onAdd }: AddListItemInputProps): React.JSX.Element {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  };

  const isReady = value.trim().length > 0;

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={t('lists.addItemPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={handleAdd}
        accessibilityLabel={t('lists.addItem')}
      />
      <Pressable
        onPress={handleAdd}
        accessibilityLabel={t('lists.addItem')}
        accessibilityRole="button"
        disabled={!isReady}
        style={({ pressed }) => [
          styles.button,
          !isReady && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
      >
        <AppIcon name="mas" size={22} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
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
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: 48,
    justifyContent: 'center',
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
    width: 48,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});

export default AddListItemInput;
