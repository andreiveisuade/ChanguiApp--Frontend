import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { Toast } from '../Toast';

describe('Toast Component', () => {
  const mockOnHide = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('no renderiza nada cuando visible es false', () => {
    const { toJSON } = render(
      <Toast message="Hola" visible={false} onHide={mockOnHide} />
    );
    expect(toJSON()).toBeNull();
  });

  it('renderiza el mensaje cuando visible es true', () => {
    const { getByText } = render(
      <Toast message="Guardado con éxito" visible onHide={mockOnHide} />
    );
    expect(getByText('Guardado con éxito')).toBeTruthy();
  });

  it('tiene accessibilityRole alert', () => {
    const { UNSAFE_queryAllByType } = render(
      <Toast message="Aviso" visible onHide={mockOnHide} />
    );
    const views = UNSAFE_queryAllByType(Animated.View);
    const alertView = views.find((v) => v.props.accessibilityRole === 'alert');
    expect(alertView).toBeTruthy();
  });

  it('renderiza con type success', () => {
    const { getByText } = render(
      <Toast message="OK" type="success" visible onHide={mockOnHide} />
    );
    expect(getByText('OK')).toBeTruthy();
  });

  it('renderiza con type error', () => {
    const { getByText } = render(
      <Toast message="Falló" type="error" visible onHide={mockOnHide} />
    );
    expect(getByText('Falló')).toBeTruthy();
  });

  it('llama a onHide cuando termina la animación', () => {
    render(<Toast message="Temporal" visible onHide={mockOnHide} duration={1000} />);
    act(() => {
      jest.runAllTimers();
    });
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it('no inicia la animación ni llama a onHide cuando visible es false', () => {
    render(<Toast message="Oculto" visible={false} onHide={mockOnHide} />);
    act(() => {
      jest.runAllTimers();
    });
    expect(mockOnHide).not.toHaveBeenCalled();
  });
});
