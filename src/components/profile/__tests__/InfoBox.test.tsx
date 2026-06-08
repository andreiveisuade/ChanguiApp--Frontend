import React from 'react';
import { render } from '@testing-library/react-native';
import { InfoBox } from '../InfoBox';

jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

describe('InfoBox Component', () => {
  it('renders the text', () => {
    const { getByText } = render(<InfoBox text="Some information" />);
    expect(getByText('Some information')).toBeTruthy();
  });

  it('renders the bombilla icon for the default info variant', () => {
    const { getByTestId } = render(<InfoBox text="Info" />);
    expect(getByTestId('app-icon').props.children).toBe('bombilla');
  });

  it('renders the alerta icon for the warning variant', () => {
    const { getByTestId } = render(<InfoBox variant="warning" text="Warning" />);
    expect(getByTestId('app-icon').props.children).toBe('alerta');
  });

  it('renders the alerta icon for the danger variant', () => {
    const { getByTestId } = render(<InfoBox variant="danger" text="Danger" />);
    expect(getByTestId('app-icon').props.children).toBe('alerta');
  });

  it('renders the bold text when provided', () => {
    const { getByText } = render(
      <InfoBox text=" regular" boldText="Important:" />
    );
    expect(getByText('Important:')).toBeTruthy();
  });

  it('does not render bold text when not provided', () => {
    const { queryByText } = render(<InfoBox text="plain" />);
    expect(queryByText('Important:')).toBeNull();
  });
});
