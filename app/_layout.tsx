import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import { DebugOverlay } from '@/components/debug/DebugOverlay';
import { queryClient } from '@/config/queryClient';
import i18n from '@/i18n';
import { colors } from '@/constants/theme';
import { installConsoleCapture } from '@/utils/installConsoleCapture';

WebBrowser.maybeCompleteAuthSession();
installConsoleCapture();

export default function RootLayout(): React.JSX.Element {
  useEffect(() => {
    void i18n.language;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <StatusBar backgroundColor={colors.surface} style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
            <DebugOverlay />
          </AuthProvider>
        </AccessibilityProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
