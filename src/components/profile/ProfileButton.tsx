import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, View } from 'react-native';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { colors, spacing, radii, iconSize, fontSize } from '@/constants/theme';

export type ProfileButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'disabled';

interface ProfileButtonProps {
  title: string;
  onPress: () => void;
  variant?: ProfileButtonVariant;
  iconName?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ProfileButton({
  title,
  onPress,
  variant = 'primary',
  iconName,
  isLoading = false,
  disabled = false,
}: ProfileButtonProps): React.JSX.Element {
  const getStyles = () => {
    const isActuallyDisabled = disabled || variant === 'disabled';
    
    if (isActuallyDisabled) {
      return {
        button: styles.disabledButton,
        text: styles.disabledText,
        iconColor: colors.textPlaceholder,
      };
    }

    switch (variant) {
      case 'secondary':
        return {
          button: styles.secondaryButton,
          text: styles.secondaryText,
          iconColor: colors.textSlate,
        };
      case 'danger':
        return {
          button: styles.dangerButton,
          text: styles.dangerText,
          iconColor: colors.white,
        };
      case 'warning':
        return {
          button: styles.warningButton,
          text: styles.warningText,
          iconColor: colors.white,
        };
      case 'primary':
      default:
        return {
          button: styles.primaryButton,
          text: styles.primaryText,
          iconColor: colors.white,
        };
    }
  };

  const currentStyles = getStyles();
  const isButtonDisabled = disabled || variant === 'disabled' || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isButtonDisabled}
      style={({ pressed }) => [
        styles.buttonBase,
        currentStyles.button,
        pressed && !isButtonDisabled && styles.buttonPressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={variant === 'secondary' ? colors.primary : colors.white} 
          size="small" 
        />
      ) : (
        <View style={styles.content}>
          {iconName ? (
            <AppIcon
              name={iconName}
              size={iconSize.sm}
              color={currentStyles.iconColor}
              style={styles.icon}
            />
          ) : null}
          <AppText variant="Body" style={[styles.textBase, currentStyles.text]}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    minHeight: 52,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    width: '100%',
    marginBottom: spacing.md,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  textBase: {
    fontSize: fontSize.h3,
    fontWeight: '600',
  },
  // Primary variant
  primaryButton: {
    backgroundColor: colors.primary, // Red/Orange primary branding
  },
  primaryText: {
    color: colors.white,
  },
  // Secondary variant
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  secondaryText: {
    color: colors.textSlate,
  },
  // Danger variant
  dangerButton: {
    backgroundColor: colors.primary, // Red
  },
  dangerText: {
    color: colors.white,
  },
  // Warning variant (e.g. orange for Cerrar sesión button)
  warningButton: {
    backgroundColor: colors.accentOrange, // Orange
  },
  warningText: {
    color: colors.white,
  },
  // Disabled variant
  disabledButton: {
    backgroundColor: colors.border,
  },
  disabledText: {
    color: colors.textPlaceholder,
  },
});

export default ProfileButton;
