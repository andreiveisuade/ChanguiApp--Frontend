import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, touchTarget } from '@/constants/theme';

type TextLinkButtonProps = {
  title: string;
  accessibilityHint: string;
  onPress: () => void;
};

export function TextLinkButton({
  title,
  accessibilityHint,
  onPress,
}: TextLinkButtonProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityRole="link"
      hitSlop={8}
      onPress={onPress}
      style={styles.button}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
  },
  text: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default TextLinkButton;
