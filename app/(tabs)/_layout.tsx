import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import useAuth from '@/viewmodels/useAuth';
import { BottomNavbar } from '@/components/layout/BottomNavbar';
import { colors, fonts } from '@/constants/theme';
import { ROUTES } from '@/constants/routes';

export default function TabsLayout(): React.JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.auth.login);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Tabs
      tabBar={(props) => <BottomNavbar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: fonts.body,
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: t('home.title') }} />
      <Tabs.Screen name="cart" options={{ title: t('nav.cart') }} />
      <Tabs.Screen name="scanner" options={{ title: t('nav.scanner') }} />
      <Tabs.Screen name="history" options={{ title: t('nav.history') }} />
      <Tabs.Screen name="settings" options={{ title: t('nav.settings') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
