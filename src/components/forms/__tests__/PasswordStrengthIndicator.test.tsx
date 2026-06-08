import React from 'react';
import { render } from '@testing-library/react-native';
import { PasswordStrengthIndicator } from '../PasswordStrengthIndicator';

const labels = { weak: 'Débil', medium: 'Media', strong: 'Fuerte' };

describe('PasswordStrengthIndicator Component', () => {
  it('shows weak strength for short or simple passwords', () => {
    const { getByText, getByLabelText } = render(
      <PasswordStrengthIndicator password="abc" labels={labels} />
    );

    expect(getByText('Débil')).toBeTruthy();
    expect(getByLabelText('Débil')).toBeTruthy();
  });

  it('shows weak strength for an empty password', () => {
    const { getByText } = render(
      <PasswordStrengthIndicator password="" labels={labels} />
    );

    expect(getByText('Débil')).toBeTruthy();
  });

  it('shows weak strength when only letters are present', () => {
    const { getByText } = render(
      <PasswordStrengthIndicator password="abcdefgh" labels={labels} />
    );

    expect(getByText('Débil')).toBeTruthy();
  });

  it('shows medium strength for letters and numbers of length 6+', () => {
    const { getByText } = render(
      <PasswordStrengthIndicator password="abc123" labels={labels} />
    );

    expect(getByText('Media')).toBeTruthy();
  });

  it('does not reach medium when length is below 6', () => {
    const { getByText } = render(
      <PasswordStrengthIndicator password="ab12" labels={labels} />
    );

    expect(getByText('Débil')).toBeTruthy();
  });

  it('shows strong strength for length 10+ with letters, numbers and symbols', () => {
    const { getByText } = render(
      <PasswordStrengthIndicator password="abcd1234!@" labels={labels} />
    );

    expect(getByText('Fuerte')).toBeTruthy();
  });

  it('stays medium when symbols are present but length is below 10', () => {
    const { getByText } = render(
      <PasswordStrengthIndicator password="ab12!@" labels={labels} />
    );

    expect(getByText('Media')).toBeTruthy();
  });
});
