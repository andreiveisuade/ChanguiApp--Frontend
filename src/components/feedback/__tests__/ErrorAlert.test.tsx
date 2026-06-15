import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorAlert } from '@/components/feedback/ErrorAlert';
import { UserFriendlyError } from '@/types/errors';

// Mock AppIcon since it might render vector-icons or complex layouts
jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return {
    AppIcon: ({ name }: { name: string }) => <Text>Icon: {name}</Text>,
  };
});

describe('ErrorAlert', () => {
  const mockError: UserFriendlyError = {
    title: 'Test Error Title',
    message: 'Test error message content.',
    actionLabel: 'Try Again',
    code: 'TEST_ERROR',
  };

  it('renders null when error is null', () => {
    const { toJSON } = render(<ErrorAlert error={null} />);
    expect(toJSON()).toBeNull();
  });

  it('renders title and message correctly when error is provided', () => {
    const { getByText } = render(<ErrorAlert error={mockError} />);

    expect(getByText('Test Error Title')).toBeTruthy();
    expect(getByText('Test error message content.')).toBeTruthy();
  });

  it('shows close button and handles onDismiss when provided', () => {
    const onDismissMock = jest.fn();
    const { getByRole } = render(<ErrorAlert error={mockError} onDismiss={onDismissMock} />);

    const closeButton = getByRole('button', { name: 'Cerrar alerta' });
    expect(closeButton).toBeTruthy();

    fireEvent.press(closeButton);
    expect(onDismissMock).toHaveBeenCalledTimes(1);
  });

  it('does not show close button when onDismiss is not provided', () => {
    const { queryByRole } = render(<ErrorAlert error={mockError} />);
    const closeButton = queryByRole('button', { name: 'Cerrar alerta' });
    expect(closeButton).toBeNull();
  });

  it('shows action button and handles onAction when actionLabel and onAction are provided', () => {
    const onActionMock = jest.fn();
    const { getByRole } = render(<ErrorAlert error={mockError} onAction={onActionMock} />);

    const actionButton = getByRole('button', { name: 'Try Again' });
    expect(actionButton).toBeTruthy();

    fireEvent.press(actionButton);
    expect(onActionMock).toHaveBeenCalledTimes(1);
  });

  it('does not show action button when onAction is not provided', () => {
    const { queryByRole } = render(<ErrorAlert error={mockError} />);
    const actionButton = queryByRole('button', { name: 'Try Again' });
    expect(actionButton).toBeNull();
  });
});
