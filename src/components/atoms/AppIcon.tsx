import React from 'react';
import { View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

const iconMap: { [key: string]: keyof typeof MaterialCommunityIcons.glyphMap } = {
  inicio: 'home-outline',
  carrito: 'cart-outline',
  escanear: 'barcode-scan',
  configuracion: 'cog-outline',
  perfil: 'account-outline',
  historial: 'history',
  tarjeta: 'credit-card-outline',
  eliminar: 'trash-can-outline',
  agregar: 'plus-circle-outline',
  exito: 'check-circle-outline',
  error: 'close-circle-outline',
  lista: 'format-list-bulleted',
  buscar: 'magnify',
  cerrar: 'close-circle-outline',
  package: 'package-variant-closed',
  editar: 'pencil-outline',
  'chevron-derecha': 'chevron-right',
  menos: 'minus-circle-outline',
  mas: 'plus-circle-outline',
  alerta: 'alert-circle-outline',
  circulo: 'checkbox-blank-circle-outline',
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
  const iconName = iconMap[name];
  if (!iconName) {
    if (__DEV__) {
      console.warn(`AppIcon: ícono no encontrado: "${name}"`);
    }
    return null;
  }

  return (
    <View style={style}>
      <MaterialCommunityIcons name={iconName} size={size} color={color} />
    </View>
  );
};
