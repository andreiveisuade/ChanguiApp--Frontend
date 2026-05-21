import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '@/utils/theme';

export default function TabsLayout(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Tabs
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
    </Tabs>
  );
}
