import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, spacing, touchTarget } from '@/utils/theme';

type AppHeaderProps = {
  onBack?: () => void;
};

export function AppHeader({ onBack }: AppHeaderProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable
          accessibilityHint={t('forgotPassword.back')}
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backButton}
        >
          <Feather color={colors.textPrimary} name="arrow-left" size={22} />
        </Pressable>
      ) : null}
      <View style={styles.brand}>
        <Feather color={colors.primary} name="shopping-cart" size={28} />
        <Text style={styles.title}>{t('app_name')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: touchTarget.minHeight,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '800',
  },
});

export default AppHeader;
