import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { colors, spacing, radii, iconSize, fontSize } from '@/constants/theme';

export type InfoBoxVariant = 'info' | 'warning' | 'danger';

interface InfoBoxProps {
  variant?: InfoBoxVariant;
  text: string;
  boldText?: string;
  style?: ViewStyle;
}

export function InfoBox({ variant = 'info', text, boldText, style }: InfoBoxProps): React.JSX.Element {
  const getStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: styles.warningContainer,
          iconColor: colors.warningIcon,
          textColor: colors.warningText,
          iconName: 'alerta',
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          iconColor: colors.error,
          textColor: colors.dangerTextDark,
          iconName: 'alerta',
        };
      case 'info':
      default:
        return {
          container: styles.infoContainer,
          iconColor: colors.infoBlue,
          textColor: colors.infoBlueTextDark,
          iconName: 'bombilla',
        };
    }
  };

  const config = getStyles();

  return (
    <View style={[styles.container, config.container, style]}>
      <AppIcon 
        name={config.iconName} 
        size={iconSize.smd}
        color={config.iconColor} 
        style={styles.icon}
      />
      <AppText variant="Body" style={[styles.text, { color: config.textColor }]}>
        {boldText ? (
          <AppText variant="Body" style={[styles.boldText, { color: config.textColor }]}>
            {boldText}
          </AppText>
        ) : null}
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontSize: fontSize.body,
    lineHeight: 18,
    fontWeight: '400',
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: fontSize.body,
  },
  infoContainer: {
    backgroundColor: colors.infoBlueSurfaceAlt,
    borderColor: colors.infoBlueBorderAlt,
  },
  warningContainer: {
    backgroundColor: colors.warningSurface,
    borderColor: colors.warningBorder,
  },
  dangerContainer: {
    backgroundColor: colors.dangerSurface,
    borderColor: colors.dangerSurfaceStrong,
  },
});

export default InfoBox;
