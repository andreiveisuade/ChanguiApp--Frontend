import ChanguiAppLogo from '@/../assets/logos/changuiapp-logo.svg';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import useBootstrapRoute from '@/hooks/useBootstrapRoute';
import { clearAllStorage } from '@/utils/storage';
import { colors } from '@/constants/theme';

export default function IndexRoute(): React.JSX.Element {
  const router = useRouter();
  const hasNavigated = useRef(false);
  const [resetKey, setResetKey] = useState(0);
  const target = useBootstrapRoute(resetKey);

  useEffect(() => {
    if (hasNavigated.current || target === null) return;

    hasNavigated.current = true;
    router.replace(target);
  }, [router, target]);

  const handleDevReset = useCallback(async (): Promise<void> => {
    await clearAllStorage();
    hasNavigated.current = false;
    setResetKey((key) => key + 1);
  }, []);

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

const styles = StyleSheet.create({
  splashContainer: {
    alignItems: 'center',
    backgroundColor: colors.primary,
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