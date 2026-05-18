import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '@/utils/theme';

const ONBOARDING_COMPLETED_KEY = '@changuiapp/onboarding_completed';
const AUTH_TOKEN_KEY = '@changuiapp/token';

export default function IndexRoute(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const redirect = async (): Promise<void> => {
      const [hasCompletedOnboarding, token] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY),
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
      ]);

      if (!isMounted) {
        return;
      }

      if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
        return;
      }

      router.replace(token ? '/(tabs)/home' : '/auth/login');
    };

    void redirect();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
