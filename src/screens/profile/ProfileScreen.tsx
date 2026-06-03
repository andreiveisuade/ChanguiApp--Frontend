import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import ErrorMessage from '@/components/feedback/ErrorMessage';
import LoadingOverlay from '@/components/feedback/LoadingOverlay';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { AvatarImage } from '@/components/profile/AvatarImage';
import { ProfileField } from '@/components/profile/ProfileField';
import { AppText } from '@/components/atoms/AppText';
import FormLabel from '@/components/forms/FormLabel';
import TextInput from '@/components/forms/TextInput';
import useAuth from '@/viewmodels/useAuth';
import useProfile from '@/viewmodels/useProfile';
import { colors, radii, spacing, touchTarget } from '@/constants/theme';

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

  const [editMode, setEditMode] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>('');
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);

  const openEdit = (): void => {
    setEditName(profile?.full_name ?? '');
    setEditAvatarUrl(profile?.avatar_url ?? '');
    setEditMode(true);
  };

  const cancelEdit = (): void => {
    setEditMode(false);
    clearError();
  };

  const handleSave = async (): Promise<void> => {
    try {
      await updateProfile({
        full_name: editName.trim(),
        avatar_url: editAvatarUrl.trim() || null,
      });
      setEditMode(false);
    } catch {
      return;
    }
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    try {
      await deleteProfile();
      await logout();
    } catch {
      setDeleteStep(0);
    }
  };

  return (
    <>
      <LoadingOverlay visible={isLoading} />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarWrapper}>
          <AvatarImage
            uri={profile?.avatar_url}
            fullName={profile?.full_name ?? ''}
            size={96}
          />
        </View>

        <View style={styles.card}>
          {!editMode ? (
            <>
              <ProfileField
                label={t('profile.name')}
                value={profile?.full_name ?? '—'}
                onEdit={openEdit}
                editAccessibilityLabel={t('profile.editField')}
              />
              <ProfileField
                label={t('profile.email')}
                value={profile?.email ?? '—'}
              />
            </>
          ) : (
            <View style={styles.editFields}>
              <TextInput
                label={t('profile.name')}
                autoCapitalize="words"
                autoFocus
                onChangeText={setEditName}
                placeholder={t('profile.namePlaceholder')}
                value={editName}
              />

              <View>
                <FormLabel>{t('profile.email')}</FormLabel>
                <AppText variant="Body" style={styles.emailValue}>
                  {profile?.email ?? '—'}
                </AppText>
              </View>

              <TextInput
                label={t('profile.avatarUrl')}
                autoCapitalize="none"
                keyboardType="url"
                onChangeText={setEditAvatarUrl}
                placeholder={t('profile.avatarUrlPlaceholder')}
                value={editAvatarUrl}
              />
            </View>
          )}
        </View>

        <ErrorMessage
          closeAccessibilityHint={t('common.dismissError')}
          message={error?.message}
          onClose={clearError}
        />

        {!editMode ? (
          <PrimaryButton
            accessibilityHint={t('profile.edit')}
            onPress={openEdit}
            title={t('profile.edit')}
          />
        ) : (
          <View style={styles.row}>
            <View style={styles.flex}>
              <SecondaryButton
                accessibilityHint={t('common.cancel')}
                disabled={isSaving}
                onPress={cancelEdit}
                title={t('common.cancel')}
              />
            </View>
            <View style={styles.gap} />
            <View style={styles.flex}>
              <PrimaryButton
                accessibilityHint={t('common.save')}
                disabled={isSaving}
                isLoading={isSaving}
                onPress={handleSave}
                title={t('common.save')}
              />
            </View>
          </View>
        )}

        {!editMode && (
          <Pressable
            onPress={() => setDeleteStep(1)}
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
          >
            <AppText variant="Body" style={styles.deleteBtnText}>
              {t('profile.deleteAccount')}
            </AppText>
          </Pressable>
        )}
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setDeleteStep(0)}
        transparent
        visible={deleteStep > 0}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {deleteStep === 1 && (
              <>
                <AppText variant="H2" style={styles.modalTitle}>
                  {t('profile.deleteConfirmTitle')}
                </AppText>
                <AppText variant="Body" style={styles.modalBody}>
                  {t('profile.deleteConfirmBody')}
                </AppText>
                <View style={styles.row}>
                  <View style={styles.flex}>
                    <SecondaryButton
                      accessibilityHint={t('common.cancel')}
                      onPress={() => setDeleteStep(0)}
                      title={t('common.cancel')}
                    />
                  </View>
                  <View style={styles.gap} />
                  <View style={styles.flex}>
                    <PrimaryButton
                      accessibilityHint={t('common.continue')}
                      onPress={() => setDeleteStep(2)}
                      title={t('common.continue')}
                    />
                  </View>
                </View>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <AppText variant="H2" style={styles.modalTitle}>
                  {t('profile.deleteFinalTitle')}
                </AppText>
                <AppText variant="Body" style={styles.modalBody}>
                  {t('profile.deleteFinalBody')}
                </AppText>
                <View style={styles.row}>
                  <View style={styles.flex}>
                    <SecondaryButton
                      accessibilityHint={t('common.cancel')}
                      disabled={isDeleting}
                      onPress={() => setDeleteStep(0)}
                      title={t('common.cancel')}
                    />
                  </View>
                  <View style={styles.gap} />
                  <View style={styles.flex}>
                    <PrimaryButton
                      accessibilityHint={t('profile.deleteConfirmBtn')}
                      disabled={isDeleting}
                      isLoading={isDeleting}
                      onPress={handleDeleteConfirm}
                      title={t('profile.deleteConfirmBtn')}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
    padding: spacing.xl,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.muted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  editFields: {
    gap: spacing.lg,
  },
  emailValue: {
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  flex: {
    flex: 1,
  },
  gap: {
    width: spacing.md,
  },
  deleteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    minHeight: touchTarget.minHeight,
  },
  deleteBtnPressed: {
    opacity: 0.6,
  },
  deleteBtnText: {
    color: colors.error,
    fontWeight: '600',
  },
  overlay: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  modalTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
});
