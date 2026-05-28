import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { colors, spacing, touchTarget } from '@/constants/theme';

interface CartHeaderProps {
  userName: string;
  onProfilePress?: () => void;
}

export function CartHeader({ userName, onProfilePress }: CartHeaderProps): React.JSX.Element {
  const { t } = useTranslation();
  const firstName = userName ? userName.trim().split(' ')[0] : '';

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <AppIcon name="carrito" size={24} color={colors.textPrimary} />
        <AppText variant="H2">{t('home.greeting', { name: firstName })}</AppText>
      </View>

      <Pressable
        style={styles.profileButton}
        onPress={onProfilePress}
        accessibilityRole="button"
        accessibilityLabel={t('auth.accessibility.goToProfile')}
        accessibilityHint={t('auth.accessibility.goToProfileHint')}
      >
        <AppIcon name="perfil" size={24} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 55,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileButton: {
    width: touchTarget.minWidth,
    height: touchTarget.minHeight,
    borderRadius: touchTarget.minWidth / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CartHeader;
