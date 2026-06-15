import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, fonts, fontSize, iconSize, spacing, touchTarget } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';

interface HistoryHeaderProps {
  userName: string;
  onProfilePress: () => void;
}

export const HistoryHeader = ({
  userName,
  onProfilePress,
}: HistoryHeaderProps): React.JSX.Element => {
  const { t } = useTranslation();
  const firstName = userName ? userName.trim().split(' ')[0] : '';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <AppIcon
            name="carrito"
            size={iconSize.lgl}
            color={colors.white}
            style={styles.cartIcon}
          />
          <AppText variant="Display" style={styles.title} numberOfLines={1}>
            {t('historyScreen.title', { name: firstName })}
          </AppText>
        </View>
        <Pressable
          onPress={onProfilePress}
          style={styles.avatarButton}
          accessibilityLabel={t('auth.accessibility.goToProfile')}
          accessibilityHint={t('auth.accessibility.goToProfileHint')}
          accessibilityRole="button"
        >
          <AppIcon name="perfil" size={iconSize.mdl} color={colors.textPrimary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 48,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSize.greeting,
    fontWeight: '800',
    color: colors.white,
    marginBottom: spacing.xs,
    flexShrink: 1,
  },
  cartIcon: {
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.h3,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  avatarButton: {
    width: touchTarget.minWidth,
    height: touchTarget.minHeight,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default HistoryHeader;
