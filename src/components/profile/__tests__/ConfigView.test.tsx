import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ConfigView } from '../ConfigView';
import { useAccessibility } from '@/context/AccessibilityContext';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, o?: any) => o?.defaultValue ?? k }),
}));

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text>{name}</Text> };
});

jest.mock('@/components/profile/ProfileButton', () => {
  const { Text, Pressable } = require('react-native');
  return {
    __esModule: true,
    default: ({ title, onPress, variant }: any) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: variant === 'disabled' }}
        onPress={onPress}
      >
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/context/AccessibilityContext', () => ({
  __esModule: true,
  FONT_SCALES: { small: 0.85, medium: 1.0, large: 1.2, xlarge: 1.4 },
  useAccessibility: jest.fn(),
}));

const mockedUseAccessibility = jest.mocked(useAccessibility);

type AccessibilityValue = ReturnType<typeof useAccessibility>;

const makeAccessibility = (overrides: Partial<AccessibilityValue> = {}): AccessibilityValue => ({
  fontScale: 1,
  fontScaleName: 'medium',
  language: 'es',
  setFontScaleName: jest.fn().mockResolvedValue(undefined),
  setLanguage: jest.fn().mockResolvedValue(undefined),
  isLoading: false,
  ...overrides,
});

describe('ConfigView Component', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAccessibility.mockReturnValue(makeAccessibility());
  });

  it('renders the language and font size options', () => {
    const { getByText } = render(<ConfigView onBack={mockOnBack} />);

    expect(getByText('Español')).toBeTruthy();
    expect(getByText('English')).toBeTruthy();
    expect(getByText('Pequeño')).toBeTruthy();
    expect(getByText('Muy grande')).toBeTruthy();
  });

  it('does not persist anything when save is pressed without changes', async () => {
    const access = makeAccessibility();
    mockedUseAccessibility.mockReturnValue(access);

    const { getByLabelText } = render(<ConfigView onBack={mockOnBack} />);

    fireEvent.press(getByLabelText('Guardar cambios'));

    await waitFor(() => expect(mockOnBack).toHaveBeenCalledTimes(1));
    expect(access.setLanguage).toHaveBeenCalledWith('es');
    expect(access.setFontScaleName).toHaveBeenCalledWith('medium');
  });

  it('persists the chosen language and font size on save', async () => {
    const access = makeAccessibility();
    mockedUseAccessibility.mockReturnValue(access);

    const { getByLabelText, getByText } = render(<ConfigView onBack={mockOnBack} />);

    fireEvent.press(getByText('English'));
    fireEvent.press(getByText('Grande'));
    fireEvent.press(getByLabelText('Guardar cambios'));

    await waitFor(() => expect(access.setLanguage).toHaveBeenCalledWith('en'));
    expect(access.setFontScaleName).toHaveBeenCalledWith('large');
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when cancel is pressed', () => {
    const { getByLabelText } = render(<ConfigView onBack={mockOnBack} />);

    fireEvent.press(getByLabelText('Cancelar'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
