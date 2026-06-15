import React, { useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import AvatarImage from '@/components/profile/AvatarImage';
import ProfileInput from '@/components/profile/ProfileInput';
import InfoBox from '@/components/profile/InfoBox';
import ProfileButton from '@/components/profile/ProfileButton';
import { colors, spacing, iconSize, fontSize } from '@/constants/theme';
import { User } from '@/types/auth';

interface EditProfileViewProps {
  user: User | null;
  isSaving: boolean;
  onSave: (data: { full_name: string; avatar_url: string | null }) => Promise<void>;
  onCancel: () => void;
}

export function EditProfileView({
  user,
  isSaving,
  onSave,
  onCancel,
}: EditProfileViewProps): React.JSX.Element {
  const { t } = useTranslation();

  const [editName, setEditName] = useState<string>(user?.full_name ?? '');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>(user?.avatar_url ?? '');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  const hasChanges =
    editName.trim() !== (user?.full_name ?? '') ||
    editAvatarUrl.trim() !== (user?.avatar_url ?? '');

  const handleSave = () => {
    if (!hasChanges) return;
    void onSave({
      full_name: editName.trim(),
      avatar_url: editAvatarUrl.trim() || null,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <AppText variant="H1" style={styles.screenTitle}>
        {t('profile.editTitle', { defaultValue: 'Editar datos personales' })}
      </AppText>

      {/* Avatar interactivo */}
      <View style={styles.avatarWrapper}>
        <Pressable
          onPress={() => setShowUrlInput(!showUrlInput)}
          style={styles.avatarPressable}
          accessibilityRole="button"
          accessibilityLabel={t('profile.changePhoto', { defaultValue: 'Cambiar foto de perfil' })}
        >
          <AvatarImage uri={editAvatarUrl.trim() || null} fullName={editName} size={120} />
          <View style={styles.cameraBadge}>
            <AppIcon name="camara" size={iconSize.xs} color={colors.textMuted} />
          </View>
        </Pressable>
        <Pressable onPress={() => setShowUrlInput(!showUrlInput)}>
          <AppText variant="Body" style={styles.changePhotoText}>
            {t('profile.changePhoto', { defaultValue: 'Cambiar foto' })}
          </AppText>
        </Pressable>
      </View>

      {/* Formulario */}
      <View style={styles.form}>
        <ProfileInput
          label={t('profile.name', { defaultValue: 'Nombre' })}
          value={editName}
          onChangeText={setEditName}
          iconName="perfil"
          autoCapitalize="words"
          placeholder={t('profile.namePlaceholder', { defaultValue: 'Tu nombre completo' })}
        />

        <ProfileInput
          label={t('profile.email', { defaultValue: 'Correo electrónico' })}
          value={user?.email ?? ''}
          iconName="mail"
          editable={false}
        />

        {showUrlInput && (
          <ProfileInput
            label={t('profile.avatarUrl', { defaultValue: 'Foto de perfil (URL)' })}
            value={editAvatarUrl}
            onChangeText={setEditAvatarUrl}
            iconName="enlace"
            autoCapitalize="none"
            keyboardType="url"
            placeholder={t('profile.avatarUrlPlaceholder', { defaultValue: 'https://...' })}
          />
        )}

        <InfoBox
          variant="info"
          boldText={t('profile.infoBoxBold', { defaultValue: 'Importante: ' })}
          text={t('profile.infoBoxText', {
            defaultValue:
              'Asegúrate de que tus datos sean correctos. Algunos cambios pueden requerir verificación.',
          })}
          style={styles.infoBox}
        />
      </View>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <ProfileButton
          title={t('common.save', { defaultValue: 'Guardar cambios' })}
          onPress={handleSave}
          variant={hasChanges && !isSaving ? 'primary' : 'disabled'}
          iconName="check"
          isLoading={isSaving}
        />
        <ProfileButton
          title={t('common.cancel', { defaultValue: 'Cancelar' })}
          onPress={onCancel}
          variant="danger"
          disabled={isSaving}
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
  screenTitle: {
    fontWeight: '800',
    color: colors.textDark,
    fontSize: fontSize.h1,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarPressable: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  changePhotoText: {
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
    fontSize: fontSize.body,
  },
  form: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  infoBox: {
    marginTop: spacing.sm,
  },
  actions: {
    width: '100%',
    marginTop: spacing.sm,
  },
});

export default EditProfileView;
