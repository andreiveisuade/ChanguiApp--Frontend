import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConfirmModal } from '../ConfirmModal';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o?.value !== undefined ? `${k} ${o.value}` : k),
  }),
}));

describe('ConfirmModal Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseProps = {
    visible: true,
    title: 'Eliminar producto',
    message: '¿Estás seguro?',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  it('renderiza título y mensaje cuando visible es true', () => {
    const { getByText } = render(<ConfirmModal {...baseProps} />);
    expect(getByText('Eliminar producto')).toBeTruthy();
    expect(getByText('¿Estás seguro?')).toBeTruthy();
  });

  it('usa los labels por defecto traducidos cuando no se pasan', () => {
    const { getByText } = render(<ConfirmModal {...baseProps} />);
    expect(getByText('common.cancel')).toBeTruthy();
    expect(getByText('common.confirm')).toBeTruthy();
  });

  it('usa confirmLabel y cancelLabel custom cuando se proveen', () => {
    const { getByText } = render(
      <ConfirmModal {...baseProps} confirmLabel="Sí, borrar" cancelLabel="No, volver" />
    );
    expect(getByText('Sí, borrar')).toBeTruthy();
    expect(getByText('No, volver')).toBeTruthy();
  });

  it('llama a onConfirm al presionar el botón de confirmar', () => {
    const { getByText } = render(<ConfirmModal {...baseProps} confirmLabel="Confirmar" />);
    fireEvent.press(getByText('Confirmar'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('llama a onCancel al presionar el botón de cancelar', () => {
    const { getByText } = render(<ConfirmModal {...baseProps} cancelLabel="Cancelar" />);
    fireEvent.press(getByText('Cancelar'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('deshabilita el botón de cancelar mientras isLoading', () => {
    const { getAllByRole } = render(
      <ConfirmModal {...baseProps} cancelLabel="Cancelar" isLoading />
    );
    const buttons = getAllByRole('button');
    const cancelButton = buttons.find(
      (b) => b.props.accessibilityState?.disabled === true
    );
    expect(cancelButton).toBeTruthy();
  });
});
