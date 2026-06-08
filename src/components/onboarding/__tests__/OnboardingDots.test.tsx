import React from 'react';
import { render } from '@testing-library/react-native';
import { OnboardingDots } from '../OnboardingDots';

describe('OnboardingDots Component', () => {
  it('renders one dot per total', () => {
    const { UNSAFE_getAllByType } = render(<OnboardingDots total={4} current={0} />);

    const { View } = require('react-native');
    // 1 container + 4 dots
    expect(UNSAFE_getAllByType(View).length).toBe(5);
  });

  it('applies the primary active style to the current dot by default', () => {
    const { UNSAFE_getAllByType } = render(<OnboardingDots total={3} current={1} />);

    const { View } = require('react-native');
    const dots = UNSAFE_getAllByType(View).slice(1);
    const widths = dots.map((d: any) => {
      const flat = Object.assign({}, ...d.props.style);
      return flat.width;
    });
    // active dot is wider (32), inactive are 8
    expect(widths).toEqual([8, 32, 8]);
  });

  it('applies the light variant active color to the current dot', () => {
    const { UNSAFE_getAllByType } = render(
      <OnboardingDots total={2} current={0} variant="light" />
    );

    const { View } = require('react-native');
    const dots = UNSAFE_getAllByType(View).slice(1);
    const activeFlat = Object.assign({}, ...dots[0].props.style);
    expect(activeFlat.width).toBe(32);
  });
});
