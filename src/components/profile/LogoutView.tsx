import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import AvatarImage from '@/components/profile/AvatarImage';
import InfoBox from '@/components/profile/InfoBox';
import ProfileButton from '@/components/profile/ProfileButton';
import { colors, spacing, radii } from '@/constants/theme';
import { User } from '@/types/auth';

interface LogoutViewProps {
  user: User | null;
  onLogout: () => Promise<void>;
  onCancel: () => void;
}

export function LogoutView({ user, onLogout, onCancel }: LogoutViewProps): React.JSX.Element {
  const { t } = useTranslation();

  const fullName = user?.full_name ?? '';
  const email = user?.email ?? '';

  return (
    <View style={styles.container}>
      {/* Icono central de logout */}
      <View style={styles.centerIconWrapper}>
        <View style={styles.iconCircle}>
          <AppIcon name="salir" size={32} color="#EA580C" />
        </View>
      </View>

      {/* Textos centrales */}
      <View style={styles.textWrapper}>
        <AppText variant="H1" style={styles.title}>
          {t('profile.logoutConfirmTitle', { defaultValue: '¿Cerrar sesión?' })}
        </AppText>
        <AppText variant="Body" style={styles.subtitle}>
          {t('profile.logoutConfirmSubtitle', { defaultValue: 'Podrás volver a iniciar sesión en cualquier momento' })}
        </AppText>
      </View>

      {/* Tarjeta del usuario actual */}
      <View style={styles.userCard}>
        <AvatarImage uri={user?.avatar_url} fullName={fullName} size={48} />
        <View style={styles.userInfo}>
          <AppText variant="H3" style={styles.userName}>
            {fullName}
          </AppText>
          <AppText variant="Body" style={styles.userEmail}>
            {email}
          </AppText>
        </View>
      </View>

      {/* Caja de advertencia */}
      <InfoBox
        variant="warning"
        boldText={t('profile.logoutBoxBold', { defaultValue: 'Importante: ' })}
        text={t('profile.logoutBoxText', {
          defaultValue: 'Asegúrate de haber guardado todos tus cambios antes de cerrar sesión.',
        })}
        style={styles.infoBox}
      />

      {/* Botones */}
      <View style={styles.actions}>
        <ProfileButton
          title={t('logout', { defaultValue: 'Sí, cerrar sesión' })}
          onPress={onLogout}
          variant="warning"
          iconName="salir"
        />
        <ProfileButton
          title={t('common.cancel', { defaultValue: 'Cancelar' })}
          onPress={onCancel}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 40,
    alignItems: 'center',
    flex: 1,
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
    backgroundColor: '#FFE5D9', // Muy claro naranja
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
    color: '#111827',
    fontSize: 26,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: radii.md,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  userInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userName: {
    fontWeight: '700',
    color: '#1F2937',
  },
  userEmail: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  infoBox: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  actions: {
    width: '100%',
    marginTop: 'auto', // Empuja las acciones al final si hay espacio
  },
});

export default LogoutView;
