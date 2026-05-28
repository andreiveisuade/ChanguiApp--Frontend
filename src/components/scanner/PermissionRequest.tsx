import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { colors, spacing, touchTarget } from '@/utils/theme';

interface PermissionRequestProps {
  onRequest: () => void;
}

export function PermissionRequest({ onRequest }: PermissionRequestProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View style={styles.center}>
      <AppText variant="Display" style={styles.title}>
        {t('scanner.permissionTitle')}
      </AppText>
      <AppText variant="Body" style={styles.text}>
        {t('scanner.permissionText')}
      </AppText>

      <Pressable
        style={styles.button}
        onPress={onRequest}
        accessibilityRole="button"
        accessibilityLabel={t('scanner.allowCamera')}
        accessibilityHint={t('scanner.allowCameraHint')}
      >
        <AppText variant="H3" style={styles.buttonText}>
          {t('scanner.allowCamera')}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    minHeight: touchTarget.minHeight,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
  },
});

export default PermissionRequest;
