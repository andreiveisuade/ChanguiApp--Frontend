import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ChanguiAppLogo from '@/../assets/logos/changuiapp-logo.svg';
import { AppIcon } from '@/components/atoms/AppIcon';
import { colors, fonts, fontSize, iconSize, spacing, touchTarget } from '@/constants/theme';

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
          <AppIcon color={colors.textPrimary} name="atras" size={iconSize.md} />
        </Pressable>
      ) : null}
      <View style={styles.brand}>
        <ChanguiAppLogo accessible={false} fill={colors.primary} height={28} width={27} />
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
    fontSize: fontSize.h1,
    fontWeight: '800',
  },
});

export default AppHeader;
