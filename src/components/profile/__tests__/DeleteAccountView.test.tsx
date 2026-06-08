import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DeleteAccountView } from '../DeleteAccountView';

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

jest.mock('@/components/profile/InfoBox', () => {
  const { Text } = require('react-native');
  return { __esModule: true, default: ({ text }: any) => <Text>{text}</Text> };
});

jest.mock('@/components/profile/ProfileButton', () => {
  const { Text, Pressable } = require('react-native');
  return {
    __esModule: true,
    default: ({ title, onPress, variant, isLoading }: any) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: variant === 'disabled' }}
        onPress={onPress}
      >
        <Text>{isLoading ? 'loading' : title}</Text>
      </Pressable>
    ),
  };
});

const CONFIRM_PHRASE = 'ELIMINAR MI CUENTA';

describe('DeleteAccountView Component', () => {
  const mockOnDelete = jest.fn().mockResolvedValue(undefined);
  const mockOnCancel = jest.fn();
  const mockOnNavigateToLogout = jest.fn();

  const baseProps = {
    onDelete: mockOnDelete,
    onCancel: mockOnCancel,
    onNavigateToLogout: mockOnNavigateToLogout,
    isDeleting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title and the deletion items list', () => {
    const { getByText } = render(<DeleteAccountView {...baseProps} />);

    expect(getByText('Eliminar cuenta')).toBeTruthy();
    expect(getByText('Todo tu historial de compras')).toBeTruthy();
    expect(getByText('Tu información personal y preferencias')).toBeTruthy();
    expect(getByText('Métodos de pago guardados')).toBeTruthy();
  });

  it('does not call onDelete when confirmation phrase is not typed', () => {
    const { getByLabelText } = render(<DeleteAccountView {...baseProps} />);

    fireEvent.press(getByLabelText('Continuar con la eliminación'));
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('calls onDelete once the confirmation phrase matches', () => {
    const { getByLabelText, getByPlaceholderText } = render(<DeleteAccountView {...baseProps} />);

    fireEvent.changeText(getByPlaceholderText('Escribe la frase exacta'), CONFIRM_PHRASE);
    fireEvent.press(getByLabelText('Continuar con la eliminación'));
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('trims surrounding whitespace when validating the phrase', () => {
    const { getByLabelText, getByPlaceholderText } = render(<DeleteAccountView {...baseProps} />);

    fireEvent.changeText(getByPlaceholderText('Escribe la frase exacta'), `  ${CONFIRM_PHRASE}  `);
    fireEvent.press(getByLabelText('Continuar con la eliminación'));
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the cancel button is pressed', () => {
    const { getByLabelText } = render(<DeleteAccountView {...baseProps} />);

    fireEvent.press(getByLabelText('Cancelar y volver'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onNavigateToLogout from the "take a break" link', () => {
    const { getByText } = render(<DeleteAccountView {...baseProps} />);

    fireEvent.press(getByText('Cerrar sesión en su lugar →'));
    expect(mockOnNavigateToLogout).toHaveBeenCalledTimes(1);
  });

  it('shows loading state on the confirm button while deleting', () => {
    const { getByText } = render(<DeleteAccountView {...baseProps} isDeleting={true} />);

    expect(getByText('loading')).toBeTruthy();
  });
});
