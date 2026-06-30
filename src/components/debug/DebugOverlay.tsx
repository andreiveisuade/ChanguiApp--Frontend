import React, { useSyncExternalStore } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/atoms/AppText';
import { colors, spacing, radii, fontSize, opacity } from '@/constants/theme';
import { API_URL } from '@/constants/api';
import { debugStore, LogSource } from '@/utils/debugStore';
import useAuth from '@/viewmodels/useAuth';

const SOURCE_LABEL: Record<LogSource, string> = {
  http: 'HTTP',
  sqlite: 'SQLite',
  cache: 'Cache',
  console: 'log',
};

/**
 * Consola de debug translúcida. Se renderiza en el root y solo aparece cuando el
 * store está activado (easter egg: 5 taps en "¡Hola, ...!"). No es modal: queda
 * flotando arriba mientras se navega y deja pasar los toques fuera del panel
 * (pointerEvents="box-none"). Se cierra con la X. Funciona en release.
 */
export const DebugOverlay = (): React.JSX.Element | null => {
  const enabled = useSyncExternalStore(debugStore.subscribe, debugStore.isEnabled);
  const logs = useSyncExternalStore(debugStore.subscribe, debugStore.getLogs);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  if (!enabled) {
    return null;
  }

  // Resumen por origen: cuántas llamadas fueron al backend (HTTP) vs SQLite
  // local vs servidas de cache (RAM), para ver el comportamiento de un vistazo.
  const counts = logs.reduce(
    (acc, entry) => {
      acc[entry.source] = (acc[entry.source] ?? 0) + 1;
      return acc;
    },
    {} as Record<LogSource, number>,
  );

  const sourceStyle = (source: LogSource): object | null => {
    if (source === 'http') return styles.srcHttp;
    if (source === 'sqlite') return styles.srcSqlite;
    if (source === 'cache') return styles.srcCache;
    return null;
  };

  return (
    <View style={styles.root} pointerEvents="box-none">
      <View style={[styles.panel, { marginTop: insets.top + spacing.sm }]}>
        <View style={styles.header}>
          <AppText style={styles.title}>Debug</AppText>
          <View style={styles.actions}>
            <Pressable onPress={debugStore.clear} hitSlop={spacing.sm} style={styles.actionBtn}>
              <AppText style={styles.actionText}>limpiar</AppText>
            </Pressable>
            <Pressable
              onPress={debugStore.disable}
              hitSlop={spacing.sm}
              style={styles.closeBtn}
              accessibilityLabel="Cerrar debug"
            >
              <AppText style={styles.closeText}>✕</AppText>
            </Pressable>
          </View>
        </View>

        <View style={styles.info}>
          <AppText style={styles.infoLine}>user.id: {user?.id ?? '(sin sesión)'}</AppText>
          <AppText style={styles.infoLine}>email: {user?.email ?? '-'}</AppText>
          <AppText style={styles.infoLine}>nombre: {user?.full_name || '-'}</AppText>
          <AppText style={styles.infoLine}>API: {API_URL}</AppText>
        </View>

        <View style={styles.summary}>
          <AppText style={[styles.summaryItem, styles.srcHttp]}>HTTP {counts.http ?? 0}</AppText>
          <AppText style={[styles.summaryItem, styles.srcSqlite]}>
            SQLite {counts.sqlite ?? 0}
          </AppText>
          <AppText style={[styles.summaryItem, styles.srcCache]}>Cache {counts.cache ?? 0}</AppText>
        </View>

        <ScrollView style={styles.logs} contentContainerStyle={styles.logsContent}>
          {logs.length === 0 ? (
            <AppText style={styles.empty}>Sin logs todavía…</AppText>
          ) : (
            logs.map((entry) => (
              <AppText
                key={entry.id}
                style={[
                  styles.logLine,
                  sourceStyle(entry.source),
                  entry.level === 'error' ? styles.logError : null,
                ]}
              >
                {entry.time} · [{SOURCE_LABEL[entry.source]}] {entry.message}
                {entry.durationMs != null ? ` · ${entry.durationMs}ms` : ''}
              </AppText>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  panel: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.debugPanel,
    borderRadius: radii.lg,
    padding: spacing.md,
    maxHeight: '55%',
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
    alignItems: 'center',
  },
  actionBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
  },
  actionText: {
    color: colors.secondary,
    fontSize: fontSize.label,
    fontWeight: '700',
  },
  closeBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  closeText: {
    color: colors.white,
    fontSize: fontSize.h3,
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
  summary: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.textSecondary,
    paddingTop: spacing.sm,
  },
  summaryItem: {
    fontSize: fontSize.label,
    fontWeight: '700',
  },
  logLine: {
    color: colors.white,
    fontSize: fontSize.label,
    marginBottom: spacing.xs,
  },
  logError: {
    color: colors.warning,
  },
  srcHttp: {
    color: colors.secondary,
  },
  srcSqlite: {
    color: colors.success,
  },
  srcCache: {
    color: colors.textSecondary,
  },
});

export default DebugOverlay;
