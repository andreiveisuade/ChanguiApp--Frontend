import ChanguiAppLogo from '@/../assets/logos/changuiapp-logo.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import AuthRepository from '@/repositories/AuthRepository';
import { colors } from '@/constants/theme';
import { STORAGE_KEYS } from '@/constants/storage';
import { ROUTES } from '@/constants/routes';

const SPLASH_DURATION_MS = 3000;

export default function IndexRoute(): React.JSX.Element {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showSplash]);

  useEffect(() => {
    if (showSplash) return;
    if (hasNavigated.current) return;

    let stillMounted = true;

    const redirect = async (): Promise<void> => {
      const [hasCompletedOnboarding, session] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.onboardingCompleted),
        AuthRepository.getStoredSession(),
      ]);

      if (!stillMounted) return;

      hasNavigated.current = true;

      if (!hasCompletedOnboarding) {
        router.replace(ROUTES.onboarding);
      } else {
        router.replace(session ? ROUTES.tabs.home : ROUTES.auth.login);
      }
    };

    void redirect();

    return () => {
      stillMounted = false;
    };
  }, [showSplash, router]);

  const handleDevReset = useCallback(async (): Promise<void> => {
    await AsyncStorage.clear();
    hasNavigated.current = false;
    setShowSplash(true);
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <ChanguiAppLogo accessible={false} height={200} width={200} />
        {__DEV__ && (
          <Pressable onPress={handleDevReset} style={styles.devReset}>
            <Text style={styles.devResetText}>Reset app (DEV)</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color={colors.primary} size="large" />
      {__DEV__ && (
        <Pressable onPress={handleDevReset} style={styles.devReset}>
          <Text style={styles.devResetText}>Reset app (DEV)</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  devReset: {
    bottom: 40,
    position: 'absolute',
  },
  devResetText: {
    fontSize: 13,
  },
});