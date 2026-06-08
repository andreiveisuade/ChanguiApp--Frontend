import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, ScrollView, View } from 'react-native';
import { ScreenWrapper } from '../ScreenWrapper';

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, style }: any) => <View style={style}>{children}</View>,
  };
});

describe('ScreenWrapper Component', () => {
  it('renders children without scroll by default', () => {
    const { getByText, UNSAFE_queryByType } = render(
      <ScreenWrapper>
        <Text>Contenido</Text>
      </ScreenWrapper>
    );

    expect(getByText('Contenido')).toBeTruthy();
    expect(UNSAFE_queryByType(ScrollView)).toBeNull();
  });

  it('renders children inside a ScrollView when withScroll is true', () => {
    const { getByText, UNSAFE_getByType } = render(
      <ScreenWrapper withScroll>
        <Text>Scrollable</Text>
      </ScreenWrapper>
    );

    expect(getByText('Scrollable')).toBeTruthy();
    expect(UNSAFE_getByType(ScrollView)).toBeTruthy();
  });

  it('applies a custom style to the content container', () => {
    const customStyle = { backgroundColor: 'green' };
    const { UNSAFE_queryAllByType } = render(
      <ScreenWrapper style={customStyle}>
        <Text>Styled</Text>
      </ScreenWrapper>
    );

    const views = UNSAFE_queryAllByType(View);
    const matchingView = views.find((v) => {
      const style = v.props.style;
      const flat = Array.isArray(style) ? style.flat(Infinity) : [style];
      return flat.includes(customStyle);
    });

    expect(matchingView).toBeTruthy();
  });
});
