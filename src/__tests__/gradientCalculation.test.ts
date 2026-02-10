import { describe, it, expect } from 'vitest';
import { computeGradientStops, computeEffectiveColors } from '../utils/gradientCalculation';
import { DEFAULT_COLOR_MAP } from '../constants/defaultColorMap';
import type { GradientSettings } from '../types';

const defaultSettings: GradientSettings = { bleed: 0.5, wordMix: 0.0 };
const sharpSettings: GradientSettings = { bleed: 0.0, wordMix: 0.0 };

describe('computeGradientStops', () => {
  it('returns empty array for empty text', () => {
    const stops = computeGradientStops('', DEFAULT_COLOR_MAP, defaultSettings);
    expect(stops).toHaveLength(0);
  });

  it('returns 2 stops for single character', () => {
    const stops = computeGradientStops('a', DEFAULT_COLOR_MAP, defaultSettings);
    expect(stops).toHaveLength(2);
    expect(stops[0].offset).toBe(0);
    expect(stops[1].offset).toBe(1);
  });

  it('produces stops for each character in sharp mode', () => {
    const stops = computeGradientStops('abc', DEFAULT_COLOR_MAP, sharpSettings);
    // Sharp mode: 2 stops per character (left edge + right edge)
    expect(stops.length).toBe(6);
  });

  it('all offsets are between 0 and 1', () => {
    const stops = computeGradientStops('hello world', DEFAULT_COLOR_MAP, defaultSettings);
    for (const stop of stops) {
      expect(stop.offset).toBeGreaterThanOrEqual(0);
      expect(stop.offset).toBeLessThanOrEqual(1);
    }
  });

  it('all colors are valid hex strings', () => {
    const stops = computeGradientStops('testing', DEFAULT_COLOR_MAP, defaultSettings);
    for (const stop of stops) {
      expect(stop.color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('handles spaces in text', () => {
    const stops = computeGradientStops('a b', DEFAULT_COLOR_MAP, defaultSettings);
    expect(stops.length).toBeGreaterThan(0);
  });

  it('bleed setting affects number of stops', () => {
    const sharpStops = computeGradientStops('abc', DEFAULT_COLOR_MAP, sharpSettings);
    const smoothStops = computeGradientStops('abc', DEFAULT_COLOR_MAP, { bleed: 1.0, wordMix: 0 });
    // Sharp mode has 2 stops per char, smooth has 1 per char (center only)
    expect(sharpStops.length).toBeGreaterThan(smoothStops.length);
  });
});

describe('computeEffectiveColors', () => {
  it('returns empty array for empty text', () => {
    const colors = computeEffectiveColors('', DEFAULT_COLOR_MAP, defaultSettings);
    expect(colors).toHaveLength(0);
  });

  it('returns one color per character', () => {
    const colors = computeEffectiveColors('hello', DEFAULT_COLOR_MAP, defaultSettings);
    expect(colors).toHaveLength(5);
  });

  it('with wordMix=0, letter colors are used directly', () => {
    const settings: GradientSettings = { bleed: 0.5, wordMix: 0.0 };
    const colors = computeEffectiveColors('ab', DEFAULT_COLOR_MAP, settings);
    expect(colors[0].hex).toBe(DEFAULT_COLOR_MAP['a'].hex);
    expect(colors[1].hex).toBe(DEFAULT_COLOR_MAP['b'].hex);
  });

  it('with wordMix=1, all letters in a word have the same color', () => {
    const settings: GradientSettings = { bleed: 0.5, wordMix: 1.0 };
    const colors = computeEffectiveColors('ab', DEFAULT_COLOR_MAP, settings);
    // At wordMix=1, both should be the word average — same hex
    expect(colors[0].hex).toBe(colors[1].hex);
  });

  it('handles uppercase by mapping to lowercase', () => {
    const settings: GradientSettings = { bleed: 0.5, wordMix: 0.0 };
    const lower = computeEffectiveColors('a', DEFAULT_COLOR_MAP, settings);
    const upper = computeEffectiveColors('A', DEFAULT_COLOR_MAP, settings);
    expect(lower[0].hex).toBe(upper[0].hex);
  });
});
