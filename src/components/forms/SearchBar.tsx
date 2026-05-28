import React from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  TextInputProps, 
  ViewStyle 
} from 'react-native';
import { colors } from '../../utils/theme';
import { AppIcon } from '../atoms/AppIcon';

interface SearchBarProps extends TextInputProps {
  onSearchPress?: () => void;
  containerStyle?: ViewStyle;
}

export const SearchBar = ({
  onSearchPress,
  containerStyle,
  onChangeText,
  ...props
}: SearchBarProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <AppIcon
        name="buscar"
        size={22}
        color={colors.textSecondary}
        style={styles.searchIcon}
      />

      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={onSearchPress}
        onChangeText={onChangeText}
        {...props}
      />

      {props.value ? (
        <TouchableOpacity
          onPress={() => onChangeText?.('')}
          activeOpacity={0.7}
          accessibilityLabel="Limpiar búsqueda"
          accessibilityRole="button"
        >
          <AppIcon name="cerrar" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Fondo blanco para resaltar sobre el fondo #FFF8F8
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    width: '100%',
    marginVertical: 10,
    // Sombra sutil para mantener el estilo de las tarjetas de la Home
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular', // Consistencia con los inputs de tu equipo
    fontSize: 15,
    color: colors.textPrimary,
    height: '100%',
    paddingVertical: 0, // Corrige desalineaciones en Android
  },
});
