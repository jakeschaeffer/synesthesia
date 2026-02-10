import { describe, it, expect } from 'vitest';
import { hexToSynColor, generateVariants, averageColors, lerpColor } from '../utils/colorUtils';

describe('hexToSynColor', () => {
  it('converts a hex string to SynColor', () => {
    const color = hexToSynColor('#ff0000');
    expect(color.hex).toBe('#ff0000');
    expect(color.h).toBeCloseTo(0, 0);
    expect(color.s).toBeCloseTo(100, 0);
    expect(color.l).toBeCloseTo(50, 0);
  });

  it('handles black', () => {
    const color = hexToSynColor('#000000');
    expect(color.hex).toBe('#000000');
    expect(color.l).toBeCloseTo(0, 0);
  });

  it('handles white', () => {
    const color = hexToSynColor('#ffffff');
    expect(color.hex).toBe('#ffffff');
    expect(color.l).toBeCloseTo(100, 0);
  });
});

describe('generateVariants', () => {
  it('returns the requested number of variants', () => {
    const variants = generateVariants('#4a90d9', 6);
    expect(variants).toHaveLength(6);
  });

  it('returns 4 variants when requested', () => {
    const variants = generateVariants('#4a90d9', 4);
    expect(variants).toHaveLength(4);
  });

  it('all variants are valid hex strings', () => {
    const variants = generateVariants('#ff6600', 6);
    for (const v of variants) {
      expect(v).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('variants differ from base color', () => {
    const base = '#4a90d9';
    const variants = generateVariants(base, 6);
    // At least some should be different
    const differentCount = variants.filter((v) => v !== base).length;
    expect(differentCount).toBeGreaterThan(0);
  });

  it('handles invalid input gracefully', () => {
    const variants = generateVariants('not-a-color', 6);
    expect(variants).toHaveLength(1);
    expect(variants[0]).toBe('not-a-color');
  });
});

describe('averageColors', () => {
  it('returns gray for empty array', () => {
    const avg = averageColors([]);
    expect(avg.hex).toBe('#808080');
  });

  it('returns the same color for single element', () => {
    const color = hexToSynColor('#ff0000');
    const avg = averageColors([color]);
    expect(avg.hex).toBe('#ff0000');
  });

  it('averages two colors', () => {
    const red = hexToSynColor('#ff0000');
    const blue = hexToSynColor('#0000ff');
    const avg = averageColors([red, blue]);
    // The average should be some purple/magenta — not red or blue
    expect(avg.hex).not.toBe('#ff0000');
    expect(avg.hex).not.toBe('#0000ff');
    expect(avg.hex).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('averaging identical colors returns the same color', () => {
    const green = hexToSynColor('#00ff00');
    const avg = averageColors([green, green, green]);
    // Should be very close to original
    const avgOklch = hexToSynColor(avg.hex);
    expect(Math.abs(avgOklch.h - green.h)).toBeLessThan(5);
  });
});

describe('lerpColor', () => {
  it('returns colorA at t=0', () => {
    const a = hexToSynColor('#ff0000');
    const b = hexToSynColor('#0000ff');
    const result = lerpColor(a, b, 0);
    expect(result.hex).toBe(a.hex);
  });

  it('returns colorB at t=1', () => {
    const a = hexToSynColor('#ff0000');
    const b = hexToSynColor('#0000ff');
    const result = lerpColor(a, b, 1);
    expect(result.hex).toBe(b.hex);
  });

  it('returns an intermediate color at t=0.5', () => {
    const a = hexToSynColor('#ff0000');
    const b = hexToSynColor('#0000ff');
    const result = lerpColor(a, b, 0.5);
    expect(result.hex).not.toBe(a.hex);
    expect(result.hex).not.toBe(b.hex);
    expect(result.hex).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('lerping between same colors returns that color', () => {
    const a = hexToSynColor('#44aa88');
    const result = lerpColor(a, a, 0.5);
    expect(result.hex).toBe(a.hex);
  });
});
