import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/context/AuthContext';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import i18n from '@/i18n';
import { colors } from '@/constants/theme';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout(): React.JSX.Element {
  useEffect(() => {
    void i18n.language;
  }, []);

  return (
    <SafeAreaProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <StatusBar backgroundColor={colors.surface} style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </AccessibilityProvider>
    </SafeAreaProvider>
  );
}
