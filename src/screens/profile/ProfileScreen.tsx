import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ErrorMessage from '@/components/feedback/ErrorMessage';
import LoadingOverlay from '@/components/feedback/LoadingOverlay';
import useAuth from '@/viewmodels/useAuth';
import useProfile from '@/viewmodels/useProfile';
import { colors } from '@/constants/theme';

// Importación de sub-vistas modulares
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileMainView from '@/components/profile/ProfileMainView';
import EditProfileView from '@/components/profile/EditProfileView';
import ConfigView from '@/components/profile/ConfigView';
import LogoutView from '@/components/profile/LogoutView';
import DeleteAccountView from '@/components/profile/DeleteAccountView';

type ViewState = 'main' | 'edit' | 'config' | 'logout' | 'delete';

export default function ProfileScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const {
    profile,
    isLoading,
    isSaving,
    isDeleting,
    error,
    updateProfile,
    deleteProfile,
    clearError,
  } = useProfile();

  const [viewState, setViewState] = useState<ViewState>('main');

  const handleSaveProfile = async (data: { full_name: string; avatar_url: string | null }) => {
    try {
      await updateProfile(data);
      setViewState('main');
    } catch {
      // El error se maneja a través del viewModel y se muestra con ErrorMessage
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      setViewState('main');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProfile();
      await logout();
    } catch {
      setViewState('main');
    }
  };

  const renderContent = () => {
    switch (viewState) {
      case 'edit':
        return (
          <EditProfileView
            user={profile}
            isSaving={isSaving}
            onSave={handleSaveProfile}
            onCancel={() => {
              clearError();
              setViewState('main');
            }}
          />
        );
      case 'config':
        return <ConfigView onBack={() => setViewState('main')} />;
      case 'logout':
        return (
          <LogoutView
            user={profile}
            onLogout={handleLogout}
            onCancel={() => setViewState('main')}
          />
        );
      case 'delete':
        return (
          <DeleteAccountView
            onDelete={handleDeleteConfirm}
            onCancel={() => setViewState('main')}
            onNavigateToLogout={() => setViewState('logout')}
            isDeleting={isDeleting}
          />
        );
      case 'main':
      default:
        return <ProfileMainView user={profile} onNavigate={(nextView) => setViewState(nextView)} />;
    }
  };

  const userName = profile?.full_name || t('home.defaultUser', { defaultValue: 'Usuario' });

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLoading} />

      {/* Header fijo coincidente en posición con los de home/carrito */}
      <ProfileHeader userName={userName} onProfilePress={() => setViewState('main')} />

      <View style={styles.divider} />

      {/* Contenido dinámico según el estado interno de la pantalla */}
      <View style={styles.content}>{renderContent()}</View>

      <ErrorMessage
        closeAccessibilityHint={t('common.dismissError', {
          defaultValue: 'Cerrar mensaje de error',
        })}
        message={error?.message}
        onClose={clearError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
