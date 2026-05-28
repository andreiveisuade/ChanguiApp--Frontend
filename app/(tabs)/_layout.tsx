import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '@/utils/theme';
import { BottomNavbar } from '@/components/layout/BottomNavbar';

export default function TabsLayout(): React.JSX.Element {
  const { t } = useTranslation();

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
