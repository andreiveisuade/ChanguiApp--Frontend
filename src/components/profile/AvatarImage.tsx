import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '@/constants/theme';

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
  const { t } = useTranslation();

  const initials = fullName
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const borderRadius = size / 2;
  const initialsSize = Math.round(size * 0.38);
  const a11yLabel = fullName || t('profile.avatarFallback');

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius }]}
        accessibilityLabel={a11yLabel}
        accessibilityRole="image"
      />
    );
  }

  return (
    <View
      style={[styles.fallback, { width: size, height: size, borderRadius }]}
      accessibilityLabel={a11yLabel}
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
    fontFamily: 'Poppins-Bold',
  },
});

export default AvatarImage;
