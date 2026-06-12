import React from 'react';
import { StyleSheet, View, TextInput, StyleProp, ViewStyle } from 'react-native';
import { AppIcon } from '@/components/atoms/AppIcon';
import FormLabel from '@/components/forms/FormLabel';
import InlineError from '@/components/forms/InlineError';
import { colors, spacing, radii, fonts, iconSize, fontSize } from '@/constants/theme';

interface ProfileInputProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  iconName: string;
  editable?: boolean;
  error?: string | null;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: StyleProp<ViewStyle>;
}

export function ProfileInput({
  label,
  value,
  onChangeText,
  placeholder,
  iconName,
  editable = true,
  error,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  style,
}: ProfileInputProps): React.JSX.Element {
  return (
    <View style={[styles.wrapper, style]}>
      <FormLabel>{label}</FormLabel>
      <View
        style={[
          styles.inputContainer,
          !editable && styles.disabledContainer,
          error ? styles.errorContainer : null,
        ]}
      >
        <AppIcon
          name={iconName}
          size={iconSize.smd}
          color={editable ? colors.textPlaceholder : colors.borderMuted}
          style={styles.icon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholderTextColor={colors.textPlaceholder}
          style={[styles.input, !editable && styles.disabledText]}
        />
      </View>
      {error ? <InlineError message={error} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  disabledContainer: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  errorContainer: {
    borderColor: colors.error,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.input,
    fontFamily: fonts.body,
    color: colors.textDark,
    paddingVertical: spacing.sm,
  },
  disabledText: {
    color: colors.textPlaceholder,
  },
});

export default ProfileInput;
