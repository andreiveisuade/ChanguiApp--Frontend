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

/*<SearchBar 
  placeholder="Buscar productos o marcas..." 
  value={text}
  onChangeText={setText}
  onSearchPress={() => miFuncionDeBusqueda(text)}
/>*/

interface SearchBarProps extends TextInputProps {
  onSearchPress?: () => void;
  containerStyle?: ViewStyle;
}

export const SearchBar = ({ 
  onSearchPress, 
  containerStyle, 
  ...props 
}: SearchBarProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Ícono de búsqueda a la izquierda */}
      <AppIcon 
        name="lista" // Usa el ícono de lista o el que prefieras de tu AppIcon
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
        onSubmitEditing={onSearchPress} // Dispara la búsqueda al presionar "Buscar" en el teclado
        {...props}
      />

      {/* Botón opcional para disparar la acción al tocar la lupa o limpiar */}
      {props.value ? (
        <TouchableOpacity onPress={onSearchPress} activeOpacity={0.7}>
          <AppIcon name="exito" size={20} color={colors.textSecondary} />
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
    height: 48,
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
