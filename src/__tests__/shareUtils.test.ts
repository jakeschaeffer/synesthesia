import { describe, it, expect } from 'vitest';
import { buildFileName, sanitizeDisplayText } from '../components/share/ShareWordColorDialog';

describe('sanitizeDisplayText', () => {
  it('trims leading and trailing whitespace', () => {
    expect(sanitizeDisplayText('  hello  ')).toBe('hello');
  });

  it('collapses multiple spaces to single space', () => {
    expect(sanitizeDisplayText('hello   world')).toBe('hello world');
  });

  it('handles tabs and newlines', () => {
    expect(sanitizeDisplayText('hello\tworld\nfoo')).toBe('hello world foo');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(sanitizeDisplayText('   ')).toBe('');
  });

  it('passes through clean text unchanged', () => {
    expect(sanitizeDisplayText('hello world')).toBe('hello world');
  });
});

describe('buildFileName', () => {
  it('generates a filename from normal text', () => {
    expect(buildFileName('hello world')).toBe('synesthesia-hello-world.png');
  });

  it('lowercases the text', () => {
    expect(buildFileName('Hello World')).toBe('synesthesia-hello-world.png');
  });

  it('replaces special characters with hyphens', () => {
    expect(buildFileName("it's a test!")).toBe('synesthesia-it-s-a-test.png');
  });

  it('strips leading and trailing hyphens', () => {
    expect(buildFileName('---hello---')).toBe('synesthesia-hello.png');
  });

  it('returns default filename for empty input', () => {
    expect(buildFileName('')).toBe('synesthesia-word-color.png');
  });

  it('returns default filename for whitespace-only input', () => {
    expect(buildFileName('   ')).toBe('synesthesia-word-color.png');
  });

  it('truncates long input to 40 characters', () => {
    const longText = 'a'.repeat(100);
    const result = buildFileName(longText);
    // "synesthesia-" prefix + up to 40 chars + ".png"
    const stem = result.replace('synesthesia-', '').replace('.png', '');
    expect(stem.length).toBeLessThanOrEqual(40);
  });
});
