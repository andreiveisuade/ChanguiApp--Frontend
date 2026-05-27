import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, fonts, spacing } from '@/utils/theme';
import { AppText } from '@/components/atoms/AppText';

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
          <AppText variant="Body" style={styles.subtitle}>
            {t('home.continueShopping')}
          </AppText>
        </View>
        <Pressable
          onPress={onProfilePress}
          style={styles.avatarButton}
          accessibilityLabel={t('profile')}
          accessibilityRole="button"
        >
          <Feather name="user" size={24} color="#000000" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#D04946',
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
  },
  greeting: {
    fontFamily: fonts.display, // Poppins from theme tokens
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body, // Inter from theme tokens
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)', // White with 80% opacity
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default HomeHeader;
