import React, { useSyncExternalStore } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/atoms/AppText';
import { colors, spacing, radii, fontSize, opacity } from '@/constants/theme';
import { API_URL } from '@/constants/api';
import { debugStore } from '@/utils/debugStore';
import useAuth from '@/viewmodels/useAuth';

/**
 * Overlay de debug. Se renderiza en el root y solo aparece cuando el store está
 * activado (easter egg: 5 taps en "¡Hola, ...!"). Muestra el usuario actual,
 * la API y un historial de logs scrolleable. Funciona en release.
 */
export const DebugOverlay = (): React.JSX.Element | null => {
  const enabled = useSyncExternalStore(debugStore.subscribe, debugStore.isEnabled);
  const logs = useSyncExternalStore(debugStore.subscribe, debugStore.getLogs);
  const { user } = useAuth();

  if (!enabled) {
    return null;
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={debugStore.disable}>
      <SafeAreaView style={styles.backdrop} edges={['top', 'bottom']}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <AppText variant="H2" style={styles.title}>
              Debug
            </AppText>
            <View style={styles.actions}>
              <Pressable onPress={debugStore.clear} style={styles.actionBtn}>
                <AppText style={styles.actionText}>Limpiar</AppText>
              </Pressable>
              <Pressable onPress={debugStore.disable} style={styles.actionBtn}>
                <AppText style={styles.actionText}>Cerrar</AppText>
              </Pressable>
            </View>
          </View>

          <View style={styles.info}>
            <AppText style={styles.infoLine}>user.id: {user?.id ?? '(sin sesión)'}</AppText>
            <AppText style={styles.infoLine}>email: {user?.email ?? '-'}</AppText>
            <AppText style={styles.infoLine}>nombre: {user?.full_name || '-'}</AppText>
            <AppText style={styles.infoLine}>API: {API_URL}</AppText>
          </View>

          <ScrollView style={styles.logs} contentContainerStyle={styles.logsContent}>
            {logs.length === 0 ? (
              <AppText style={styles.empty}>Sin logs todavía…</AppText>
            ) : (
              logs.map((entry) => (
                <AppText
                  key={entry.id}
                  style={[styles.logLine, entry.level === 'error' ? styles.logError : null]}
                >
                  {entry.time} · {entry.message}
                </AppText>
              ))
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  panel: {
    backgroundColor: colors.textPrimary,
    borderRadius: radii.lg,
    padding: spacing.md,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: fontSize.h2,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
  },
  actionText: {
    color: colors.white,
    fontSize: fontSize.label,
    fontWeight: '700',
  },
  info: {
    borderTopWidth: 1,
    borderTopColor: colors.textSecondary,
    paddingVertical: spacing.sm,
  },
  infoLine: {
    color: colors.white,
    fontSize: fontSize.label,
    marginBottom: spacing.xs,
  },
  logs: {
    borderTopWidth: 1,
    borderTopColor: colors.textSecondary,
    marginTop: spacing.xs,
  },
  logsContent: {
    paddingVertical: spacing.sm,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: fontSize.label,
    opacity: opacity.disabled,
  },
  logLine: {
    color: colors.white,
    fontSize: fontSize.label,
    marginBottom: spacing.xs,
  },
  logError: {
    color: colors.warning,
  },
});

export default DebugOverlay;
