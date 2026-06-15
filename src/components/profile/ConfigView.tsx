import React, { useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import ProfileButton from '@/components/profile/ProfileButton';
import {
  useAccessibility,
  FontScaleOption,
  LanguageOption,
  FONT_SCALES,
} from '@/context/AccessibilityContext';
import { colors, spacing, radii, iconSize, fontSize } from '@/constants/theme';

interface ConfigViewProps {
  onBack: () => void;
}

export function ConfigView({ onBack }: ConfigViewProps): React.JSX.Element {
  const { t } = useTranslation();
  const accessibility = useAccessibility();

  // Estados temporales locales antes de guardar
  const [tempLanguage, setTempLanguage] = useState<LanguageOption>(accessibility.language);
  const [tempFontScaleName, setTempFontScaleName] = useState<FontScaleOption>(
    accessibility.fontScaleName,
  );

  const hasChanges =
    tempLanguage !== accessibility.language || tempFontScaleName !== accessibility.fontScaleName;

  const handleSave = async () => {
    await accessibility.setLanguage(tempLanguage);
    await accessibility.setFontScaleName(tempFontScaleName);
    onBack();
  };

  const fontScaleOptions: { key: FontScaleOption; label: string }[] = [
    { key: 'small', label: t('profile.fontSizes.small', { defaultValue: 'Pequeño' }) },
    { key: 'medium', label: t('profile.fontSizes.medium', { defaultValue: 'Mediano' }) },
    { key: 'large', label: t('profile.fontSizes.large', { defaultValue: 'Grande' }) },
    { key: 'xlarge', label: t('profile.fontSizes.xlarge', { defaultValue: 'Muy grande' }) },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <AppText variant="H1" style={styles.screenTitle}>
        {t('profile.configTitle', { defaultValue: 'Configuración' })}
      </AppText>
      <AppText variant="Body" style={styles.screenSubtitle}>
        {t('profile.configSubtitle', {
          defaultValue: 'Personaliza la apariencia y el idioma de la aplicación',
        })}
      </AppText>

      {/* Sección 1: Idioma */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppIcon
            name="idioma"
            size={iconSize.smd}
            color={colors.textSlate}
            style={styles.sectionIcon}
          />
          <AppText variant="H2" style={styles.sectionTitle}>
            {t('profile.languageSection', { defaultValue: 'Idioma' })}
          </AppText>
        </View>

        {/* Tarjeta de Español */}
        <Pressable
          onPress={() => setTempLanguage('es')}
          style={[styles.optionCard, tempLanguage === 'es' ? styles.optionCardSelected : null]}
        >
          <View style={styles.optionLeft}>
            <AppText variant="H2" style={styles.flagEmoji}>
              🇦🇷
            </AppText>
            <AppText variant="H3" style={styles.optionLabel}>
              {t('lang_es', { defaultValue: 'Español' })}
            </AppText>
          </View>
          {tempLanguage === 'es' && (
            <AppIcon name="check-circulo" size={iconSize.md} color={colors.successStrong} />
          )}
        </Pressable>

        {/* Tarjeta de Inglés */}
        <Pressable
          onPress={() => setTempLanguage('en')}
          style={[styles.optionCard, tempLanguage === 'en' ? styles.optionCardSelected : null]}
        >
          <View style={styles.optionLeft}>
            <AppText variant="H2" style={styles.flagEmoji}>
              🇺🇸
            </AppText>
            <AppText variant="H3" style={styles.optionLabel}>
              {t('lang_en', { defaultValue: 'English' })}
            </AppText>
          </View>
          {tempLanguage === 'en' && (
            <AppIcon name="check-circulo" size={iconSize.md} color={colors.successStrong} />
          )}
        </Pressable>

        {/* Tarjeta de Portugués */}
        <Pressable
          onPress={() => setTempLanguage('pt')}
          style={[styles.optionCard, tempLanguage === 'pt' ? styles.optionCardSelected : null]}
        >
          <View style={styles.optionLeft}>
            <AppText variant="H2" style={styles.flagEmoji}>
              🇧🇷
            </AppText>
            <AppText variant="H3" style={styles.optionLabel}>
              {t('lang_pt', { defaultValue: 'Português' })}
            </AppText>
          </View>
          {tempLanguage === 'pt' && (
            <AppIcon name="check-circulo" size={iconSize.md} color={colors.successStrong} />
          )}
        </Pressable>
      </View>

      {/* Sección 2: Tamaño de Fuente */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppIcon
            name="fuente"
            size={iconSize.smd}
            color={colors.textSlate}
            style={styles.sectionIcon}
          />
          <AppText variant="H2" style={styles.sectionTitle}>
            {t('profile.fontSizeSection', { defaultValue: 'Tamaño de fuente' })}
          </AppText>
        </View>

        {fontScaleOptions.map((opt) => {
          const isSelected = tempFontScaleName === opt.key;
          const scaleFactor = FONT_SCALES[opt.key];

          return (
            <Pressable
              key={opt.key}
              onPress={() => setTempFontScaleName(opt.key)}
              style={[styles.optionCard, isSelected ? styles.optionCardSelected : null]}
            >
              <View style={styles.optionLeft}>
                <AppText
                  variant="Body"
                  style={[styles.fontSizePrefix, { fontSize: fontSize.h3 * scaleFactor }]}
                >
                  Aa
                </AppText>
                <AppText variant="H3" style={styles.optionLabel}>
                  {opt.label}
                </AppText>
              </View>
              {isSelected && (
                <AppIcon name="check-circulo" size={iconSize.md} color={colors.successStrong} />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Sección 3: Vista Previa */}
      <View style={styles.section}>
        <AppText variant="Label" style={styles.previewLabel}>
          {t('profile.preview', { defaultValue: 'Vista previa' })}
        </AppText>
        <View style={styles.previewContainer}>
          <AppText
            variant="Body"
            style={[
              styles.previewText,
              { fontSize: fontSize.body * FONT_SCALES[tempFontScaleName] },
            ]}
          >
            {t('profile.previewText', {
              defaultValue:
                'Este es un texto de ejemplo para visualizar el tamaño de fuente seleccionado.',
            })}
          </AppText>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <ProfileButton
          title={t('common.save', { defaultValue: 'Guardar cambios' })}
          onPress={handleSave}
          variant={hasChanges ? 'primary' : 'disabled'}
          iconName="check"
        />
        <ProfileButton
          title={t('common.cancel', { defaultValue: 'Cancelar' })}
          onPress={onBack}
          variant="danger"
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
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  screenSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.body,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontWeight: '700',
    color: colors.textDark,
    fontSize: fontSize.h3,
  },
  optionCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  optionCardSelected: {
    backgroundColor: colors.indigoSurfaceAlt,
    borderColor: colors.indigoBorder,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    marginRight: spacing.sm,
    fontSize: fontSize.h1,
  },
  fontSizePrefix: {
    marginRight: spacing.sm,
    fontWeight: '600',
    color: colors.textSlateMuted,
    width: 28,
    textAlign: 'center',
  },
  optionLabel: {
    fontWeight: '500',
    color: colors.textSlateDark,
  },
  previewLabel: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: fontSize.label,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  previewContainer: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewText: {
    color: colors.textSlate,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    marginTop: spacing.sm,
  },
});

export default ConfigView;
