import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';

type LoadingOverlayProps = {
  visible: boolean;
};

export function LoadingOverlay({ visible }: LoadingOverlayProps): React.JSX.Element | null {
  if (!visible) {
    return null;
  }

  return (
    <Modal transparent visible={visible}>
      <View style={styles.backdrop}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
  },
});

export default LoadingOverlay;
