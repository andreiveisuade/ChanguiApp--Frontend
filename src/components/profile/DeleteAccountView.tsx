import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import InfoBox from '@/components/profile/InfoBox';
import ProfileButton from '@/components/profile/ProfileButton';
import { colors, spacing, radii, fonts, iconSize, fontSize } from '@/constants/theme';

export const CONFIRM_PHRASE = 'ELIMINAR MI CUENTA';

interface DeleteAccountViewProps {
  onDelete: () => Promise<void>;
  onCancel: () => void;
  onNavigateToLogout: () => void;
  isDeleting: boolean;
}

export function DeleteAccountView({
  onDelete,
  onCancel,
  onNavigateToLogout,
  isDeleting,
}: DeleteAccountViewProps): React.JSX.Element {
  const { t } = useTranslation();
  const [confirmationText, setConfirmationText] = useState<string>('');

  const isConfirmed = confirmationText.trim() === CONFIRM_PHRASE;

  const handleDelete = () => {
    if (!isConfirmed) return;
    void onDelete();
  };

  const listItems = [
    { icon: 'carrito', text: t('profile.deleteItems.history', { defaultValue: 'Todo tu historial de compras' }) },
    { icon: 'perfil', text: t('profile.deleteItems.info', { defaultValue: 'Tu información personal y preferencias' }) },
    { icon: 'tarjeta', text: t('profile.deleteItems.payment', { defaultValue: 'Métodos de pago guardados' }) },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Icono central de papelera */}
      <View style={styles.centerIconWrapper}>
        <View style={styles.iconCircle}>
          <AppIcon name="eliminar" size={iconSize.xxl} color={colors.danger} />
        </View>
      </View>

      {/* Textos centrales */}
      <View style={styles.textWrapper}>
        <AppText variant="H1" style={styles.title}>
          {t('profile.deleteAccount', { defaultValue: 'Eliminar cuenta' })}
        </AppText>
        <AppText variant="Body" style={styles.subtitle}>
          {t('profile.deleteConfirmSubtitle', { defaultValue: 'Esta acción es permanente y no se puede deshacer' })}
        </AppText>
      </View>

      {/* Caja de peligro */}
      <InfoBox
        variant="danger"
        boldText={t('profile.deleteBoxBold', { defaultValue: '¡Atención! Esta acción es irreversible. ' })}
        text={t('profile.deleteBoxText', {
          defaultValue: 'Al eliminar tu cuenta perderás permanentemente:',
        })}
        style={styles.infoBox}
      />

      {/* Sección: Se eliminará */}
      <View style={styles.listSection}>
        <AppText variant="H3" style={styles.listHeader}>
          {t('profile.willBeDeleted', { defaultValue: 'Se eliminará:' })}
        </AppText>

        {listItems.map((item, idx) => (
          <View key={idx} style={styles.listItemCard}>
            <AppIcon name={item.icon} size={iconSize.smd} color={colors.textMuted} style={styles.listItemIcon} />
            <AppText variant="Body" style={styles.listItemText}>
              {item.text}
            </AppText>
          </View>
        ))}
      </View>

      {/* Caja: ¿Necesitas un descanso? */}
      <View style={styles.breakBox}>
        <AppText variant="H3" style={styles.breakTitle}>
          {t('profile.needABreakTitle', { defaultValue: '¿Necesitas un descanso?' })}
        </AppText>
        <AppText variant="Body" style={styles.breakText}>
          {t('profile.needABreakText', {
            defaultValue: 'En lugar de eliminar tu cuenta, puedes simplemente cerrar sesión y volver cuando quieras.',
          })}
        </AppText>
        <Pressable onPress={onNavigateToLogout}>
          <AppText variant="Body" style={styles.breakLink}>
            {t('profile.needABreakLink', { defaultValue: 'Cerrar sesión en su lugar →' })}
          </AppText>
        </Pressable>
      </View>

      {/* Campo de confirmación */}
      <View style={styles.confirmSection}>
        <AppText variant="Body" style={styles.confirmLabel}>
          {t('profile.confirmDeletePrompt', { defaultValue: 'Para confirmar, escribe: ' })}
          <AppText variant="Body" style={styles.confirmPhraseBold}>
            {CONFIRM_PHRASE}
          </AppText>
        </AppText>
        
        <View style={[styles.inputContainer, isConfirmed && styles.inputContainerConfirmed]}>
          <TextInput
            value={confirmationText}
            onChangeText={setConfirmationText}
            placeholder={t('profile.confirmDeletePlaceholder', { defaultValue: 'Escribe la frase exacta' })}
            placeholderTextColor={colors.textPlaceholder}
            autoCapitalize="characters"
            style={styles.input}
          />
        </View>
      </View>

      {/* Botones */}
      <View style={styles.actions}>
        <ProfileButton
          title={t('profile.deleteConfirmBtn', { defaultValue: 'Continuar con la eliminación' })}
          onPress={handleDelete}
          variant={isConfirmed && !isDeleting ? 'danger' : 'disabled'}
          isLoading={isDeleting}
        />
        <ProfileButton
          title={t('profile.deleteCancelBtn', { defaultValue: 'Cancelar y volver' })}
          onPress={onCancel}
          variant="secondary"
          disabled={isDeleting}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  centerIconWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.dangerSurfaceStrong, // Muy claro rojo
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontWeight: '800',
    color: colors.textDark,
    fontSize: fontSize.h1,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.h3,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoBox: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  listSection: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  listHeader: {
    fontWeight: '700',
    color: colors.textDark,
    fontSize: fontSize.h3,
    marginBottom: spacing.md,
  },
  listItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  listItemIcon: {
    marginRight: spacing.md,
  },
  listItemText: {
    color: colors.textSlateMuted,
    fontSize: fontSize.body,
    fontWeight: '500',
  },
  breakBox: {
    backgroundColor: colors.infoBlueSurface, // Celeste muy claro
    borderWidth: 1,
    borderColor: colors.infoBlueBorder,
    borderRadius: radii.md,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
  },
  breakTitle: {
    fontWeight: '700',
    color: colors.infoBlueText,
    fontSize: fontSize.h3,
    marginBottom: spacing.xs,
  },
  breakText: {
    color: colors.infoBlueTextDark,
    fontSize: fontSize.body,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  breakLink: {
    color: colors.infoBlue,
    fontWeight: '700',
    fontSize: fontSize.body,
  },
  confirmSection: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  confirmLabel: {
    color: colors.textSlate,
    fontSize: fontSize.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  confirmPhraseBold: {
    fontWeight: '800',
    color: colors.primary,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  inputContainerConfirmed: {
    borderColor: colors.successStrong,
  },
  input: {
    fontSize: fontSize.input,
    fontFamily: fonts.body,
    color: colors.textDark,
    paddingVertical: spacing.sm,
  },
  actions: {
    width: '100%',
  },
});

export default DeleteAccountView;
