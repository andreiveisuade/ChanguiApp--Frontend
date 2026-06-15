import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle, TextProps } from 'react-native';
import { colors, fontSize } from '@/constants/theme';
import { useAccessibility } from '@/context/AccessibilityContext';

// Definimos las variantes según tu escala tipográfica de branding
type TextVariant = 'Display' | 'H1' | 'H2' | 'H3' | 'Body' | 'Label' | 'Price';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export const AppText = ({ variant = 'Body', children, style, ...props }: AppTextProps) => {
  const { fontScale } = useAccessibility();

  const baseStyle = styles[variant] as TextStyle;
  const flatStyle = StyleSheet.flatten(style) || {};

  const baseFontSize = flatStyle.fontSize ?? baseStyle.fontSize;
  const baseLineHeight = flatStyle.lineHeight ?? baseStyle.lineHeight;

  const scaledStyle: TextStyle = {
    fontSize: baseFontSize ? baseFontSize * fontScale : undefined,
    lineHeight: baseLineHeight ? baseLineHeight * fontScale : undefined,
  };

  return (
    <Text style={[baseStyle, style, scaledStyle]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  Display: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize.display,
    color: colors.textPrimary,
  },
  H1: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize.h1,
    color: colors.textPrimary,
  },
  H2: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontSize.h2,
    color: colors.textPrimary,
  },
  H3: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize.h3,
    color: colors.textPrimary,
  },
  Body: {
    fontFamily: 'Inter-Regular',
    fontSize: fontSize.body,
    color: colors.textSecondary, // #6B6B6B según tu branding
    lineHeight: 20,
  },
  Label: {
    fontFamily: 'Inter-Medium',
    fontSize: fontSize.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  Price: {
    fontFamily: 'Inter-Bold',
    fontSize: fontSize.price,
    color: colors.primary, // #DC4040 para resaltar el costo
  },
});
