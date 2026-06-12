import React, { useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import ProfileButton from '@/components/profile/ProfileButton';
import { useAccessibility, FontScaleOption, LanguageOption, FONT_SCALES } from '@/context/AccessibilityContext';
import { colors, spacing, radii, iconSize } from '@/constants/theme';

interface ConfigViewProps {
  onBack: () => void;
}

export function ConfigView({ onBack }: ConfigViewProps): React.JSX.Element {
  const { t } = useTranslation();
  const accessibility = useAccessibility();

  // Estados temporales locales antes de guardar
  const [tempLanguage, setTempLanguage] = useState<LanguageOption>(accessibility.language);
  const [tempFontScaleName, setTempFontScaleName] = useState<FontScaleOption>(accessibility.fontScaleName);

  const hasChanges =
    tempLanguage !== accessibility.language ||
    tempFontScaleName !== accessibility.fontScaleName;

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
        {t('profile.configSubtitle', { defaultValue: 'Personaliza la apariencia y el idioma de la aplicación' })}
      </AppText>

      {/* Sección 1: Idioma */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppIcon name="idioma" size={iconSize.smd} color="#374151" style={styles.sectionIcon} />
          <AppText variant="H2" style={styles.sectionTitle}>
            {t('profile.languageSection', { defaultValue: 'Idioma' })}
          </AppText>
        </View>

        {/* Tarjeta de Español */}
        <Pressable
          onPress={() => setTempLanguage('es')}
          style={[
            styles.optionCard,
            tempLanguage === 'es' ? styles.optionCardSelected : null,
          ]}
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
            <AppIcon name="check-circulo" size={iconSize.md} color="#10B981" />
          )}
        </Pressable>

        {/* Tarjeta de Inglés */}
        <Pressable
          onPress={() => setTempLanguage('en')}
          style={[
            styles.optionCard,
            tempLanguage === 'en' ? styles.optionCardSelected : null,
          ]}
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
            <AppIcon name="check-circulo" size={iconSize.md} color="#10B981" />
          )}
        </Pressable>

        {/* Tarjeta de Portugués */}
        <Pressable
          onPress={() => setTempLanguage('pt')}
          style={[
            styles.optionCard,
            tempLanguage === 'pt' ? styles.optionCardSelected : null,
          ]}
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
            <AppIcon name="check-circulo" size={iconSize.md} color="#10B981" />
          )}
        </Pressable>
      </View>

      {/* Sección 2: Tamaño de Fuente */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppIcon name="fuente" size={iconSize.smd} color="#374151" style={styles.sectionIcon} />
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
              style={[
                styles.optionCard,
                isSelected ? styles.optionCardSelected : null,
              ]}
            >
              <View style={styles.optionLeft}>
                <AppText
                  variant="Body"
                  style={[
                    styles.fontSizePrefix,
                    { fontSize: 16 * scaleFactor }
                  ]}
                >
                  Aa
                </AppText>
                <AppText variant="H3" style={styles.optionLabel}>
                  {opt.label}
                </AppText>
              </View>
              {isSelected && (
                <AppIcon name="check-circulo" size={iconSize.md} color="#10B981" />
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
              { fontSize: 14 * FONT_SCALES[tempFontScaleName] }
            ]}
          >
            {t('profile.previewText', {
              defaultValue: 'Este es un texto de ejemplo para visualizar el tamaño de fuente seleccionado.',
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
    paddingBottom: 40,
  },
  screenTitle: {
    fontWeight: '800',
    color: '#111827',
    fontSize: 24,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  screenSubtitle: {
    color: '#6B7280',
    fontSize: 14,
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
    color: '#111827',
    fontSize: 17,
  },
  optionCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  optionCardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    marginRight: spacing.sm,
    fontSize: 22,
  },
  fontSizePrefix: {
    marginRight: spacing.sm,
    fontWeight: '600',
    color: '#4B5563',
    width: 28,
    textAlign: 'center',
  },
  optionLabel: {
    fontWeight: '500',
    color: '#1F2937',
  },
  previewLabel: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 11,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  previewContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewText: {
    color: '#374151',
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    marginTop: spacing.sm,
  },
});

export default ConfigView;
