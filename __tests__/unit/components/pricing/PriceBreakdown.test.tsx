import React from 'react';
import { render } from '@testing-library/react-native';
import { PriceBreakdown } from '@/components/pricing/PriceBreakdown';

// t devuelve la key para poder asertar sobre las labels fijas.
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// AppText arrastra AccessibilityContext → AsyncStorage (NativeModule no
// disponible en Jest). Se mockea con un Text plano, igual que ErrorAlert
// mockea AppIcon.
jest.mock('@/components/atoms/AppText', () => {
  const { Text } = require('react-native');
  return { AppText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text> };
});

describe('PriceBreakdown', () => {
  it('muestra precio sin IVA, la línea de IVA y el total', () => {
    const { getByText } = render(
      <PriceBreakdown
        subtotalNet={1239.67}
        taxLines={[{ label: 'IVA (21%)', amount: 260.33 }]}
        total={1500}
      />
    );

    expect(getByText('pricing.priceWithoutTax')).toBeTruthy();
    expect(getByText('$1.240')).toBeTruthy();
    expect(getByText('IVA (21%)')).toBeTruthy();
    expect(getByText('$260')).toBeTruthy();
    expect(getByText('pricing.total')).toBeTruthy();
    expect(getByText('$1.500')).toBeTruthy();
  });

  it('renderiza una línea por cada alícuota', () => {
    const { getByText } = render(
      <PriceBreakdown
        subtotalNet={2000}
        taxLines={[
          { label: 'IVA (21%)', amount: 260.33 },
          { label: 'IVA (10,5%)', amount: 105 },
        ]}
        total={2365}
      />
    );

    expect(getByText('IVA (21%)')).toBeTruthy();
    expect(getByText('IVA (10,5%)')).toBeTruthy();
  });

  it('sin líneas de IVA igual muestra sin IVA y total', () => {
    const { getByText } = render(
      <PriceBreakdown subtotalNet={850} taxLines={[]} total={850} />
    );

    expect(getByText('pricing.priceWithoutTax')).toBeTruthy();
    expect(getByText('pricing.total')).toBeTruthy();
  });
});
