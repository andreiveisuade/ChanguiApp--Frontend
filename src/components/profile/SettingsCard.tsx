import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';
import { colors, spacing, radii } from '@/constants/theme';

interface SettingsCardProps {
  title: string;
  description: string;
  iconName: string;
  iconColor: string;
  iconBgColor: string;
  onPress: () => void;
}

export function SettingsCard({
  title,
  description,
  iconName,
  iconColor,
  iconBgColor,
  onPress,
}: SettingsCardProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${description}`}
    >
      <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
        <AppIcon name={iconName} size={20} color={iconColor} />
      </View>
      <View style={styles.textWrapper}>
        <AppText variant="H3" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="Body" style={styles.description}>
          {description}
        </AppText>
      </View>
      <AppIcon name="chevron-derecha" size={20} color="#9CA3AF" style={styles.arrow} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.85,
    backgroundColor: '#F9FAFB',
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  arrow: {
    marginLeft: spacing.sm,
  },
});

export default SettingsCard;
