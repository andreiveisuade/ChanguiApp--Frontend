import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '../../utils/theme';
import { AppIcon } from '../atoms/AppIcon';
import { AppText } from '../atoms/AppText';

const { width } = Dimensions.get('window');

export const BottomNavbar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        // Definimos las etiquetas amigables para el diseño
        const labelMap: { [key: string]: string } = {
          Home: 'Inicio',
          Cart: 'Carrito',
          Scanner: 'Escanear',
          Profile: 'Perfil',
        };
        const label = labelMap[route.name] || route.name;

        // Mapeamos las rutas a los nombres de tu AppIcon
        const iconMap: { [key: string]: string } = {
          Home: 'carrito', // Puedes cambiarlo por un icono de casa si lo sumás
          Cart: 'carrito',
          Scanner: 'escanear',
          Profile: 'perfil',
        };
        const iconName = iconMap[route.name] || 'carrito';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // CASO ESPECIAL: El botón central de Escáner destacado
        if (route.name === 'Scanner') {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.scannerButtonContainer}
              activeOpacity={0.8}
            >
              <View style={styles.scannerButton}>
                <AppIcon name={iconName} size={28} color="#FFFFFF" />
              </View>
              <AppText variant="Label" style={styles.scannerLabel}>
                {label}
              </AppText>
            </TouchableOpacity>
          );
        }

        // BOTONES ESTÁNDAR (Home, Carrito, Perfil)
        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <AppIcon 
              name={iconName} 
              size={24} 
              color={isFocused ? colors.primary : colors.textSecondary} 
            />
            <AppText 
              variant="Label" 
              style={[
                styles.tabLabel, 
                { color: isFocused ? colors.primary : colors.textSecondary }
              ]}
            >
              {label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 70,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 10, // Espacio para la navegación gestual de iOS/Android
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    textTransform: 'none', // Pisamos el uppercase por defecto del átomo si es necesario
    fontFamily: 'Inter-Medium',
  },
  scannerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width / 5,
    bottom: 15, // Hace que el botón flote hacia arriba
  },
  scannerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary, // #DC4040 del branding
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra pronunciada para el botón flotante
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  scannerLabel: {
    fontSize: 10,
    marginTop: 8,
    color: colors.textSecondary,
    fontFamily: 'Inter-Medium',
    textTransform: 'none',
  },
});
