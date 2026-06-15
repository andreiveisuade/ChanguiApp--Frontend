import React from 'react';
import { Image } from 'react-native';
import { render } from '@testing-library/react-native';
import { AvatarImage } from '../AvatarImage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o?.value !== undefined ? `${k} ${o.value}` : k),
  }),
}));

describe('AvatarImage Component', () => {
  it('renders an Image with the given uri', () => {
    const { UNSAFE_getByType } = render(
      <AvatarImage uri="https://example.com/avatar.png" fullName="John Doe" />,
    );

    const image = UNSAFE_getByType(Image);
    expect(image.props.source).toEqual({ uri: 'https://example.com/avatar.png' });
    expect(image.props.accessibilityLabel).toBe('John Doe');
    expect(image.props.accessibilityRole).toBe('image');
  });

  it('renders initials fallback when no uri is provided', () => {
    const { getByText, getByLabelText } = render(<AvatarImage fullName="John Doe" />);

    expect(getByText('JD')).toBeTruthy();
    expect(getByLabelText('John Doe')).toBeTruthy();
  });

  it('uses only the first two words for the initials', () => {
    const { getByText } = render(<AvatarImage fullName="John Michael Doe" />);
    expect(getByText('JM')).toBeTruthy();
  });

  it('renders "?" when fullName is empty', () => {
    const { getByText, getByLabelText } = render(<AvatarImage />);
    expect(getByText('?')).toBeTruthy();
    expect(getByLabelText('profile.avatarFallback')).toBeTruthy();
  });

  it('falls back to the translated label when fullName is empty', () => {
    const { getByLabelText } = render(<AvatarImage fullName="" />);
    expect(getByLabelText('profile.avatarFallback')).toBeTruthy();
  });

  it('applies a custom size to the fallback view', () => {
    const { getByText } = render(<AvatarImage fullName="Ana" size={80} />);
    const initials = getByText('A');
    const flat = Object.assign({}, ...[].concat(initials.props.style));
    expect(flat.fontSize).toBe(Math.round(80 * 0.38));
  });
});
