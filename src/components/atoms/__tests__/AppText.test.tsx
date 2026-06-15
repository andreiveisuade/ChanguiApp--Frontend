import React from 'react';
import { render } from '@testing-library/react-native';
import { AppText } from '../AppText';

const mockUseAccessibility = jest.fn();
jest.mock('@/context/AccessibilityContext', () => ({
  useAccessibility: () => mockUseAccessibility(),
}));

describe('AppText Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAccessibility.mockReturnValue({ fontScale: 1 });
  });

  it('renders children text correctly', () => {
    const { getByText } = render(<AppText>Hello World</AppText>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders with different variants (Display, H1, etc.)', () => {
    const { getByText: getByTextDisplay } = render(
      <AppText variant="Display">Display Text</AppText>,
    );
    const { getByText: getByTextH1 } = render(<AppText variant="H1">H1 Text</AppText>);
    const { getByText: getByTextPrice } = render(<AppText variant="Price">Price Text</AppText>);

    expect(getByTextDisplay('Display Text')).toBeTruthy();
    expect(getByTextH1('H1 Text')).toBeTruthy();
    expect(getByTextPrice('Price Text')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { color: 'red', fontSize: 20 };
    const { getByText } = render(
      <AppText style={customStyle} variant="Body">
        Styled Text
      </AppText>,
    );
    const textElement = getByText('Styled Text');
    expect(textElement.props.style).toContainEqual(customStyle);
  });

  it('scales font size and line height based on accessibility fontScale', () => {
    mockUseAccessibility.mockReturnValue({ fontScale: 1.5 });

    // Body variant default: fontSize 14, lineHeight 20
    const { getByText } = render(<AppText variant="Body">Scaled Text</AppText>);
    const textElement = getByText('Scaled Text');

    // We inspect the last object in style array (scaledStyle which is [baseStyle, style, scaledStyle])
    const appliedStyles = textElement.props.style;
    const scaledStyle = appliedStyles[2]; // index 2 is scaledStyle

    expect(scaledStyle.fontSize).toBe(14 * 1.5);
    expect(scaledStyle.lineHeight).toBe(20 * 1.5);
  });
});
