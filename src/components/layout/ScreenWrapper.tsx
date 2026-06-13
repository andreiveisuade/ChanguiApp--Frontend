import React from 'react';
import { 
  StyleSheet, 
  View, 
  ViewStyle, 
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  withScroll?: boolean; // Permite activar scroll completo si la pantalla es larga
}

export const ScreenWrapper = ({ 
  children, 
  style, 
  withScroll = false 
}: ScreenWrapperProps) => {
  
  // Renderiza el contenido interno con o sin scroll dinámicamente
  const renderContent = () => {
    if (withScroll) {
      return (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, style]}
        >
          {children}
        </ScrollView>
      );
    }
    return (
      <View style={[styles.content, style]}>
        {children}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Configura la barra de estado superior del celular */}
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={colors.background} 
      />
      
      {/* Evita que el teclado pise los elementos inferiores en formularios */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {renderContent()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Aplica el #FFF8F8 de tu branding
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg, // Margen lateral estándar para Changuiapp
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl, // Espacio extra al final del scroll para que no pegue abajo
  },
});
