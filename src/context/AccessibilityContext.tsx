import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';

export type FontScaleOption = 'small' | 'medium' | 'large' | 'xlarge';
export type LanguageOption = 'es' | 'en' | 'pt';

export const FONT_SCALES: Record<FontScaleOption, number> = {
  small: 0.85,
  medium: 1.0,
  large: 1.2,
  xlarge: 1.4,
};

const STORAGE_KEYS = {
  fontSize: '@changuiapp/font_size',
  language: '@changuiapp/language',
};

interface AccessibilityContextValue {
  fontScale: number;
  fontScaleName: FontScaleOption;
  language: LanguageOption;
  setFontScaleName: (scale: FontScaleOption) => Promise<void>;
  setLanguage: (lang: LanguageOption) => Promise<void>;
  isLoading: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps): React.JSX.Element {
  const [fontScaleName, setFontScaleNameState] = useState<FontScaleOption>('medium');
  const [language, setLanguageState] = useState<LanguageOption>('es');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [savedFontSize, savedLanguage] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.fontSize),
          AsyncStorage.getItem(STORAGE_KEYS.language),
        ]);

        if (savedFontSize) {
          setFontScaleNameState(savedFontSize as FontScaleOption);
        }

        if (savedLanguage) {
          const lang = savedLanguage as LanguageOption;
          setLanguageState(lang);
          void i18n.changeLanguage(lang);
        } else {
          // Si no hay guardado, usar el de i18n por defecto
          const currentLang = (i18n.language || 'es').substring(0, 2) as LanguageOption;
          const supported: LanguageOption[] = ['es', 'en', 'pt'];
          setLanguageState(supported.includes(currentLang) ? currentLang : 'es');
        }
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, []);

  const setFontScaleName = useCallback(async (scale: FontScaleOption) => {
    try {
      setFontScaleNameState(scale);
      await AsyncStorage.setItem(STORAGE_KEYS.fontSize, scale);
    } catch (error) {
      console.error('Error saving font size setting:', error);
    }
  }, []);

  const setLanguage = useCallback(async (lang: LanguageOption) => {
    try {
      setLanguageState(lang);
      await i18n.changeLanguage(lang);
      await AsyncStorage.setItem(STORAGE_KEYS.language, lang);
    } catch (error) {
      console.error('Error saving language setting:', error);
    }
  }, []);

  const fontScale = FONT_SCALES[fontScaleName];

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      fontScale,
      fontScaleName,
      language,
      setFontScaleName,
      setLanguage,
      isLoading,
    }),
    [fontScale, fontScaleName, language, setFontScaleName, setLanguage, isLoading],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
