import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n from '@/i18n';
import { colors } from '@/utils/theme';

export default function RootLayout(): React.JSX.Element {
  useEffect(() => {
    void i18n.language;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={colors.surface} style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
