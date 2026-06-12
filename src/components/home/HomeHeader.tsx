import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, fonts, fontSize, spacing, radii, touchTarget, iconSize, shadow } from '@/constants/theme';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';

interface HomeHeaderProps {
  userName: string;
  onProfilePress: () => void;
}

export const HomeHeader = ({ userName, onProfilePress }: HomeHeaderProps) => {
  const { t } = useTranslation();
  const firstName = userName ? userName.trim().split(' ')[0] : '';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <AppText variant="Display" style={styles.greeting} numberOfLines={1}>
            {t('home.greeting', { name: firstName })}
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
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  greeting: {
    fontFamily: fonts.display,
    fontSize: fontSize.greeting,
    fontWeight: '800',
    color: colors.white,
  },
  avatarButton: {
    width: touchTarget.minWidth,
    height: touchTarget.minHeight,
    borderRadius: touchTarget.minWidth / 2,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.card,
  },
});

export default HomeHeader;
