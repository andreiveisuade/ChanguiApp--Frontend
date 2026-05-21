import React from 'react';
import { View, ViewStyle } from 'react-native';
// Importamos MaterialCommunityIcons que suele ser el más completo
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { colors } from '../../utils/theme';


const iconMap: { [key: string]: keyof typeof MaterialCommunityIcons.glyphMap } = {
  'carrito': 'cart-outline',
  'escanear': 'barcode-scan',
  'configuracion': 'cog-outline',
  'perfil': 'account-outline',
  'historial': 'history',
  'tarjeta': 'credit-card-outline',
  'eliminar': 'trash-can-outline',
  'agregar': 'plus-circle-outline',
  'exito': 'check-circle-outline',
  'error': 'close-circle-outline',
  'lista': 'format-list-bulleted',
};

interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const AppIcon = ({ 
  name, 
  size = 24, 
  color = colors.primary, 
  style 
}: AppIconProps) => {
  // Buscamos el icono en el mapa, si no existe usamos el carrito por defecto
  const iconName = iconMap[name] || 'cart-outline';

  return (
    <View style={style}>
      <MaterialCommunityIcons name={iconName} size={size} color={color} />
    </View>
  );
};
