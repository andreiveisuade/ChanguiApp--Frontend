import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { colors } from '../../utils/theme';
import { AppIcon } from '../atoms/AppIcon';
import { AppText } from '../atoms/AppText';

const { width } = Dimensions.get('window');

const ICON_MAP: { [key: string]: string } = {
  Home: 'inicio',
  Cart: 'carrito',
  Scanner: 'escanear',
  History: 'historial',
  Settings: 'configuracion',
};

const LABEL_KEYS: { [key: string]: string } = {
  Home: 'nav.home',
  Cart: 'nav.cart',
  Scanner: 'nav.scanner',
  History: 'nav.history',
  Settings: 'nav.settings',
};

export const BottomNavbar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 8 }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const capitalizedName = route.name.charAt(0).toUpperCase() + route.name.slice(1);
        const labelKey = LABEL_KEYS[capitalizedName];
        const label = labelKey ? t(labelKey) : route.name;
        const iconName = ICON_MAP[capitalizedName] || 'inicio';

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
        if (capitalizedName === 'Scanner') {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.scannerButtonContainer}
              activeOpacity={0.8}
              accessibilityLabel={label}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
            >
              <View style={styles.scannerButton}>
                <AppIcon name={iconName} size={26} color="#FFFFFF" />
              </View>
              <AppText variant="Label" style={styles.scannerLabel}>
                {label}
              </AppText>
            </TouchableOpacity>
          );
        }

        // BOTONES ESTÁNDAR (Inicio, Carrito, Historial, Ajustes)
        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
            accessibilityLabel={label}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
          >
            <AppIcon
              name={iconName}
              size={22}
              color={isFocused ? colors.primary : colors.textSecondary}
            />
            <AppText
              variant="Label"
              style={[
                styles.tabLabel,
                { color: isFocused ? colors.primary : colors.textSecondary },
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
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    textTransform: 'none',
    fontFamily: 'Inter-Medium',
  },
  scannerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: width / 5,
    marginTop: -20,
  },
  scannerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  scannerLabel: {
    fontSize: 10,
    marginTop: 4,
    color: colors.textSecondary,
    fontFamily: 'Inter-Medium',
    textTransform: 'none',
  },
});
