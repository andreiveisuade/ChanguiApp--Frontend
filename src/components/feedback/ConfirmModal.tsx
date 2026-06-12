import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, fontSize, radii, spacing } from '@/constants/theme';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onCancel}
        accessibilityLabel={t('common.cancel')}
      >
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <View style={styles.actionItem}>
              <SecondaryButton
                title={cancelLabel ?? t('common.cancel')}
                accessibilityHint={t('common.cancel')}
                onPress={onCancel}
                disabled={isLoading}
              />
            </View>
            <View style={styles.actionItem}>
              <PrimaryButton
                title={confirmLabel ?? t('common.confirm')}
                accessibilityHint={t('common.confirm')}
                onPress={onConfirm}
                isLoading={isLoading}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    gap: spacing.lg,
    padding: spacing.xl,
    width: '100%',
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: fontSize.h2,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: fontSize.h3,
    lineHeight: 22,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionItem: {
    flex: 1,
  },
});

export default ConfirmModal;
