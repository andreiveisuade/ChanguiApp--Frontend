import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OnboardingFooter } from '../OnboardingFooter';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, o?: any) => (o?.value !== undefined ? `${k} ${o.value}` : k),
  }),
}));

jest.mock('@/components/buttons/PrimaryButton', () => {
  const { Text, Pressable } = require('react-native');
  return {
    __esModule: true,
    default: ({ title, onPress }: any) => (
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@/components/onboarding/OnboardingDots', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ current, total }: any) => (
      <View testID="onboarding-dots" accessibilityValue={{ now: current, max: total }} />
    ),
  };
});

describe('OnboardingFooter Component', () => {
  const mockOnNext = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the next label when not on the last slide', () => {
    const { getByText } = render(
      <OnboardingFooter
        isLast={false}
        current={0}
        total={3}
        onNext={mockOnNext}
        onSkip={mockOnSkip}
      />
    );

    expect(getByText('onboarding.next')).toBeTruthy();
  });

  it('renders the finish label when on the last slide', () => {
    const { getByText } = render(
      <OnboardingFooter
        isLast
        current={2}
        total={3}
        onNext={mockOnNext}
        onSkip={mockOnSkip}
      />
    );

    expect(getByText('onboarding.finish')).toBeTruthy();
  });

  it('forwards current and total to the dots', () => {
    const { getByTestId } = render(
      <OnboardingFooter
        isLast={false}
        current={1}
        total={3}
        onNext={mockOnNext}
        onSkip={mockOnSkip}
      />
    );

    expect(getByTestId('onboarding-dots').props.accessibilityValue).toEqual({
      now: 1,
      max: 3,
    });
  });

  it('calls onNext when the button is pressed', () => {
    const { getByRole } = render(
      <OnboardingFooter
        isLast={false}
        current={0}
        total={3}
        onNext={mockOnNext}
        onSkip={mockOnSkip}
      />
    );

    fireEvent.press(getByRole('button'));
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when pressing finish on the last slide', () => {
    const { getByRole } = render(
      <OnboardingFooter
        isLast
        current={2}
        total={3}
        onNext={mockOnNext}
        onSkip={mockOnSkip}
      />
    );

    fireEvent.press(getByRole('button'));
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });
});
