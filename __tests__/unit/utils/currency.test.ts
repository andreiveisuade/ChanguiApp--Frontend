import { formatARS, formatRate } from '@/utils/currency';

describe('formatARS', () => {
  it('formats a whole integer correctly', () => {
    expect(formatARS(1000)).toBe('$1.000');
  });

  it('rounds decimal values before formatting', () => {
    expect(formatARS(1250.75)).toBe('$1.251');
    expect(formatARS(1250.4)).toBe('$1.250');
  });

  it('formats zero as $0', () => {
    expect(formatARS(0)).toBe('$0');
  });

  it('formats a large number with thousand separators', () => {
    expect(formatARS(1234567)).toBe('$1.234.567');
  });

  it('formats a small integer without separator', () => {
    expect(formatARS(99)).toBe('$99');
  });
});

describe('formatRate', () => {
  it('formats an integer rate', () => {
    expect(formatRate(21)).toBe('21%');
    expect(formatRate(0)).toBe('0%');
  });

  it('formats a decimal rate with comma', () => {
    expect(formatRate(10.5)).toBe('10,5%');
  });
});
