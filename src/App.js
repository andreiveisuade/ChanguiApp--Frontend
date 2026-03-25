import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

export default function App() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('app_name')}</Text>
      <Text>{t('pay')}</Text>
      <TouchableOpacity onPress={() => i18n.changeLanguage('es')}>
        <Text>{t('lang_es')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => i18n.changeLanguage('en')}>
        <Text>{t('lang_en')}</Text>
      </TouchableOpacity>
    </View>
  );
}

