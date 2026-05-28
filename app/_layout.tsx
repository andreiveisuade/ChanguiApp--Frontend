import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/context/AuthContext';
import i18n from '@/i18n';
import { colors } from '@/utils/theme';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout(): React.JSX.Element {
  useEffect(() => {
    void i18n.language;
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar backgroundColor={colors.surface} style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
