import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { colors, spacing, touchTarget, iconSize } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  onProfilePress?: () => void;
}

export function ScreenHeader({ title, onProfilePress }: ScreenHeaderProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.left}>
          <AppIcon name="carrito" size={iconSize.mdl} color={colors.textPrimary} />
          <AppText variant="H2">{title}</AppText>
        </View>

        <Pressable
          style={styles.profileButton}
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel={t('auth.accessibility.goToProfile')}
          accessibilityHint={t('auth.accessibility.goToProfileHint')}
        >
          <AppIcon name="perfil" size={iconSize.mdl} color={colors.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.white,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 56,
  },
  profileButton: {
    width: touchTarget.minWidth,
    height: touchTarget.minHeight,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ScreenHeader;
