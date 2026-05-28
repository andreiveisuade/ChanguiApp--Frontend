import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, touchTarget } from '@/utils/theme';
import { AppText } from '@/components/atoms/AppText';

interface ProfileFieldProps {
  label: string;
  value: string;
  onEdit?: () => void;
  editAccessibilityLabel?: string;
}

export function ProfileField({
  label,
  value,
  onEdit,
  editAccessibilityLabel,
}: ProfileFieldProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AppText variant="Label" style={styles.label}>{label}</AppText>
        <AppText variant="H3">{value}</AppText>
      </View>
      {onEdit ? (
        <Pressable
          onPress={onEdit}
          accessibilityLabel={editAccessibilityLabel ?? label}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.editButton, pressed && styles.editPressed]}
        >
          <Feather name="edit-2" size={18} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    textTransform: 'none',
  },
  editButton: {
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPressed: {
    opacity: 0.6,
  },
});

export default ProfileField;
