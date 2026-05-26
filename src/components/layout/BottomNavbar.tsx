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
  Profile: 'perfil',
};

const LABEL_KEYS: { [key: string]: string } = {
  Home: 'nav.home',
  Cart: 'nav.cart',
  Scanner: 'nav.scanner',
  Profile: 'nav.profile',
};

export const BottomNavbar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 10 }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const labelKey = LABEL_KEYS[route.name];
        const label = labelKey ? t(labelKey) : route.name;
        const iconName = ICON_MAP[route.name] || 'carrito';

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
              accessibilityLabel={label}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
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
            accessibilityLabel={label}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
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
    minHeight: 70,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'relative',
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
    textTransform: 'none',
    fontFamily: 'Inter-Medium',
  },
  scannerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width / 5,
    bottom: 15,
  },
  scannerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    marginTop: 8,
    color: colors.textSecondary,
    fontFamily: 'Inter-Medium',
    textTransform: 'none',
  },
});
