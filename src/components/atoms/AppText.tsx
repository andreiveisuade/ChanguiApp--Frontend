import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle, TextProps } from 'react-native';
import { colors } from '@/constants/theme';

// Definimos las variantes según tu escala tipográfica de branding
type TextVariant = 'Display' | 'H1' | 'H2' | 'H3' | 'Body' | 'Label' | 'Price';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export const AppText = ({ 
  variant = 'Body', 
  children, 
  style, 
  ...props 
}: AppTextProps) => {
  
  return (
    <Text 
      style={[styles[variant], style]} 
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  Display: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: colors.textPrimary,
  },
  H1: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: colors.textPrimary,
  },
  H2: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.textPrimary,
  },
  H3: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: colors.textPrimary,
  },
  Body: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary, // #6B6B6B según tu branding
    lineHeight: 20,
  },
  Label: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  Price: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.primary, // #DC4040 para resaltar el costo
  },
});
