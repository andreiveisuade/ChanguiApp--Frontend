import React from 'react';
import { render } from '@testing-library/react-native';
import { ActivityIndicator } from 'react-native';
import { LoadingOverlay } from '../LoadingOverlay';

describe('LoadingOverlay Component', () => {
  it('no renderiza nada cuando visible es false', () => {
    const { toJSON } = render(<LoadingOverlay visible={false} />);
    expect(toJSON()).toBeNull();
  });

  it('renderiza el ActivityIndicator cuando visible es true', () => {
    const { UNSAFE_queryAllByType } = render(<LoadingOverlay visible />);
    const indicators = UNSAFE_queryAllByType(ActivityIndicator);
    expect(indicators.length).toBeGreaterThan(0);
  });
});
