import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { AuthContainer } from '../AuthContainer';

describe('AuthContainer Component', () => {
  it('renders children correctly without crashing', () => {
    const { getByText } = render(
      <AuthContainer>
        <Text>Auth Children Text</Text>
      </AuthContainer>,
    );

    expect(getByText('Auth Children Text')).toBeTruthy();
  });

  it('applies custom contentStyle if provided', () => {
    const customContentStyle = { padding: 40, backgroundColor: 'blue' };
    const { getByText, UNSAFE_queryAllByType } = render(
      <AuthContainer contentStyle={customContentStyle}>
        <Text>Styled Child</Text>
      </AuthContainer>,
    );

    expect(getByText('Styled Child')).toBeTruthy();

    // Find the View that has customContentStyle in its style array
    const views = UNSAFE_queryAllByType(View);
    const matchingView = views.find((v) => {
      const style = v.props.style;
      if (Array.isArray(style)) {
        return style.includes(customContentStyle);
      }
      return style === customContentStyle;
    });

    expect(matchingView).toBeTruthy();
  });
});
