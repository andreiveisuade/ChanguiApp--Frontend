import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ErrorMessage from '@/components/feedback/ErrorMessage';
import LoadingOverlay from '@/components/feedback/LoadingOverlay';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { AvatarImage } from '@/components/profile/AvatarImage';
import { ProfileField } from '@/components/profile/ProfileField';
import useAuth from '@/viewmodels/useAuth';
import useProfile from '@/viewmodels/useProfile';
import { colors, fonts, radii, spacing, touchTarget } from '@/constants/theme';

export function ProfileScreen(): React.JSX.Element {
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
            <>
              <Text style={styles.label}>{t('profile.name')}</Text>
              <TextInput
                autoCapitalize="words"
                autoFocus
                onChangeText={setEditName}
                placeholder={t('profile.namePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                value={editName}
              />

              <View style={styles.separator} />

              <Text style={styles.label}>{t('profile.email')}</Text>
              <Text style={styles.value}>{profile?.email ?? '—'}</Text>

              <View style={styles.separator} />

              <Text style={styles.label}>{t('profile.avatarUrl')}</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="url"
                onChangeText={setEditAvatarUrl}
                placeholder={t('profile.avatarUrlPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                value={editAvatarUrl}
              />
            </>
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
            <Text style={styles.deleteBtnText}>{t('profile.deleteAccount')}</Text>
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
                <Text style={styles.modalTitle}>{t('profile.deleteConfirmTitle')}</Text>
                <Text style={styles.modalBody}>{t('profile.deleteConfirmBody')}</Text>
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
                <Text style={styles.modalTitle}>{t('profile.deleteFinalTitle')}</Text>
                <Text style={styles.modalBody}>{t('profile.deleteFinalBody')}</Text>
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
  label: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  separator: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.md,
  },
  input: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 1.5,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 16,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
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
    fontFamily: fonts.body,
    fontSize: 15,
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
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalBody: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
});

export default ProfileScreen;
