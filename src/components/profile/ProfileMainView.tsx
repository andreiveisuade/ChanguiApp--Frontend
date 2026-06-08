import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import AvatarImage from '@/components/profile/AvatarImage';
import SettingsCard from '@/components/profile/SettingsCard';
import { spacing, radii } from '@/constants/theme';
import { User } from '@/types/auth';

interface ProfileMainViewProps {
  user: User | null;
  onNavigate: (view: 'edit' | 'config' | 'logout' | 'delete') => void;
}

export function ProfileMainView({ user, onNavigate }: ProfileMainViewProps): React.JSX.Element {
  const { t } = useTranslation();

  const fullName = user?.full_name ?? '';
  const email = user?.email ?? '';

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Tarjeta de perfil superior */}
      <View style={styles.profileCard}>
        <AvatarImage uri={user?.avatar_url} fullName={fullName} size={96} />
        <View style={styles.profileInfo}>
          <AppText variant="H2" style={styles.userName}>
            {fullName}
          </AppText>
          <View style={styles.emailContainer}>
            <AppIcon name="mail" size={16} color="#6B7280" style={styles.emailIcon} />
            <AppText variant="Body" style={styles.userEmail}>
              {email}
            </AppText>
          </View>
        </View>
      </View>

      {/* Sección 1: Información Personal */}
      <View style={styles.section}>
        <AppText variant="Label" style={styles.sectionLabel}>
          {t('profile.sections.personalInfo', { defaultValue: 'INFORMACIÓN PERSONAL' })}
        </AppText>
        <SettingsCard
          title={t('profile.menu.editData', { defaultValue: 'Editar datos' })}
          description={t('profile.menu.editDataDesc', { defaultValue: 'Nombre, email, teléfono' })}
          iconName="editar"
          iconColor="#4F46E5"
          iconBgColor="#EFF2FE"
          onPress={() => onNavigate('edit')}
        />
      </View>

      {/* Sección 2: Preferencias */}
      <View style={styles.section}>
        <AppText variant="Label" style={styles.sectionLabel}>
          {t('profile.sections.preferences', { defaultValue: 'PREFERENCIAS' })}
        </AppText>
        <SettingsCard
          title={t('profile.menu.config', { defaultValue: 'Configuración' })}
          description={t('profile.menu.configDesc', { defaultValue: 'Idioma, tamaño de fuente' })}
          iconName="configuracion"
          iconColor="#475569"
          iconBgColor="#F1F5F9"
          onPress={() => onNavigate('config')}
        />
      </View>

      {/* Sección 3: Cuenta */}
      <View style={styles.section}>
        <AppText variant="Label" style={styles.sectionLabel}>
          {t('profile.sections.account', { defaultValue: 'CUENTA' })}
        </AppText>
        <SettingsCard
          title={t('profile.menu.logout', { defaultValue: 'Cerrar sesión' })}
          description={t('profile.menu.logoutDesc', { defaultValue: 'Salir de tu cuenta' })}
          iconName="salir"
          iconColor="#EA580C"
          iconBgColor="#FFF7ED"
          onPress={() => onNavigate('logout')}
        />
        <SettingsCard
          title={t('profile.menu.deleteAccount', { defaultValue: 'Eliminar cuenta' })}
          description={t('profile.menu.deleteAccountDesc', { defaultValue: 'Borrar permanentemente' })}
          iconName="eliminar"
          iconColor="#EF4444"
          iconBgColor="#FEF2F2"
          onPress={() => onNavigate('delete')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FAF5F5',
    borderColor: '#F3EAEA',
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  userName: {
    fontWeight: '800',
    color: '#111827',
    fontSize: 22,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  emailIcon: {
    marginRight: spacing.xs,
  },
  userEmail: {
    color: '#6B7280',
    fontSize: 14,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
});

export default ProfileMainView;
