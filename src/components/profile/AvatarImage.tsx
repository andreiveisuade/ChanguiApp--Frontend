import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/utils/theme';

interface AvatarImageProps {
  uri?: string | null;
  fullName?: string;
  size?: number;
}

export function AvatarImage({
  uri,
  fullName = '',
  size = 56,
}: AvatarImageProps): React.JSX.Element {
  const initials = fullName
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const borderRadius = size / 2;
  const initialsSize = Math.round(size * 0.35);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius }]}
        accessibilityLabel={fullName || 'Avatar'}
        accessibilityRole="image"
      />
    );
  }

  return (
    <View
      style={[styles.fallback, { width: size, height: size, borderRadius }]}
      accessibilityLabel={fullName || 'Avatar'}
      accessibilityRole="image"
    >
      <Text style={[styles.initials, { fontSize: initialsSize }]}>
        {initials || '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.white,
    fontFamily: fonts.display,
    fontWeight: '700',
  },
});

export default AvatarImage;
