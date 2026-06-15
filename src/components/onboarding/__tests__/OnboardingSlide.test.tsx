import React from 'react';
import { render } from '@testing-library/react-native';
import { OnboardingSlide } from '../OnboardingSlide';

jest.mock('@/components/atoms/AppIcon', () => {
  const { Text } = require('react-native');
  return { AppIcon: ({ name }: any) => <Text testID="app-icon">{name}</Text> };
});

describe('OnboardingSlide Component', () => {
  it('renders icon, title, text and applies width correctly', () => {
    const { getByText, getByTestId, UNSAFE_getByType } = render(
      <OnboardingSlide
        icon="escanear"
        title="Escanea productos"
        text="Apunta con la cámara al código de barra."
        width={375}
      />,
    );

    expect(getByText('Escanea productos')).toBeTruthy();
    expect(getByText('Apunta con la cámara al código de barra.')).toBeTruthy();
    expect(getByTestId('app-icon').props.children).toBe('escanear');

    // The container View should have the width style applied
    const { View } = require('react-native');
    const containerView = UNSAFE_getByType(View);
    // styles.container is first, then { width: 375 }
    expect(containerView.props.style).toContainEqual({ width: 375 });
  });
});
