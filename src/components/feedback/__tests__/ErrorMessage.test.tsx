import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('no renderiza nada si message es null o undefined', () => {
    const { toJSON: toJSONNull } = render(
      <ErrorMessage message={null} closeAccessibilityHint="Close" onClose={mockOnClose} />
    );
    expect(toJSONNull()).toBeNull();

    const { toJSON: toJSONUndefined } = render(
      <ErrorMessage message={undefined} closeAccessibilityHint="Close" onClose={mockOnClose} />
    );
    expect(toJSONUndefined()).toBeNull();
  });

  it('renderiza un mensaje string simple', () => {
    const { getByText, UNSAFE_queryAllByType } = render(
      <ErrorMessage
        message="Algo salió mal"
        closeAccessibilityHint="Cerrar mensaje de error"
        onClose={mockOnClose}
      />
    );

    expect(getByText('Algo salió mal')).toBeTruthy();
    
    const views = UNSAFE_queryAllByType(View);
    const alertView = views.find(v => v.props.accessibilityRole === 'alert');
    expect(alertView).toBeTruthy();
  });

  it('renderiza un objeto UserFriendlyError con título y mensaje', () => {
    const errorObj = {
      title: 'Error de Red',
      message: 'No se pudo establecer conexión con el servidor.',
    };

    const { getByText, UNSAFE_queryAllByType } = render(
      <ErrorMessage
        message={errorObj}
        closeAccessibilityHint="Cerrar mensaje de error"
        onClose={mockOnClose}
      />
    );

    expect(getByText('Error de Red')).toBeTruthy();
    expect(getByText('No se pudo establecer conexión con el servidor.')).toBeTruthy();

    const views = UNSAFE_queryAllByType(View);
    const alertView = views.find(v => v.props.accessibilityRole === 'alert');
    expect(alertView).toBeTruthy();
  });

  it('llama a onClose cuando se presiona el botón de cierre', () => {
    const { getByRole } = render(
      <ErrorMessage
        message="Error"
        closeAccessibilityHint="Cerrar"
        onClose={mockOnClose}
      />
    );

    const closeButton = getByRole('button');
    fireEvent.press(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
