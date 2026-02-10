import type { ColorMap, GradientSettings, GradientStop, SynColor } from '../types';
import { averageColors, lerpColor } from './colorUtils';

const SPACE_COLOR: SynColor = { hex: '#2a2a3e', h: 240, s: 20, l: 20 };

interface WordSegment {
  chars: string[];
  startIndex: number;
}

function splitIntoWords(text: string): WordSegment[] {
  const words: WordSegment[] = [];
  let current: string[] = [];
  let startIndex = 0;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ' || text[i] === '\n' || text[i] === '\t') {
      if (current.length > 0) {
        words.push({ chars: current, startIndex });
        current = [];
      }
      // Spaces are individual "words"
      words.push({ chars: [text[i]], startIndex: i });
      startIndex = i + 1;
    } else {
      if (current.length === 0) startIndex = i;
      current.push(text[i]);
    }
  }
  if (current.length > 0) {
    words.push({ chars: current, startIndex });
  }

  return words;
}

export function computeEffectiveColors(
  text: string,
  colorMap: ColorMap,
  gradientSettings: GradientSettings,
): SynColor[] {
  if (text.length === 0) return [];

  const words = splitIntoWords(text);
  const effectiveColors: SynColor[] = new Array(text.length);

  for (const word of words) {
    const isSpace = word.chars.length === 1 && /\s/.test(word.chars[0]);

    if (isSpace) {
      effectiveColors[word.startIndex] = SPACE_COLOR;
      continue;
    }

    // Gather letter colors for this word
    const wordLetterColors: SynColor[] = [];
    for (const char of word.chars) {
      const key = char.toLowerCase();
      wordLetterColors.push(colorMap[key] ?? SPACE_COLOR);
    }

    // Compute word average color
    const wordAvg = averageColors(wordLetterColors);

    // Blend each letter's color with the word average
    for (let j = 0; j < word.chars.length; j++) {
      const letterColor = wordLetterColors[j];
      const blended = lerpColor(letterColor, wordAvg, gradientSettings.wordMix);
      effectiveColors[word.startIndex + j] = blended;
    }
  }

  return effectiveColors;
}

export function computeGradientStops(
  text: string,
  colorMap: ColorMap,
  gradientSettings: GradientSettings,
): GradientStop[] {
  const effectiveColors = computeEffectiveColors(text, colorMap, gradientSettings);
  const charCount = effectiveColors.length;
  if (charCount === 0) return [];

  const stops: GradientStop[] = [];
  const bleed = gradientSettings.bleed;

  if (charCount === 1) {
    stops.push({ offset: 0, color: effectiveColors[0].hex });
    stops.push({ offset: 1, color: effectiveColors[0].hex });
    return stops;
  }

  if (bleed < 0.01) {
    // Sharp mode: each character is a solid stripe
    for (let i = 0; i < charCount; i++) {
      const leftEdge = i / charCount;
      const rightEdge = (i + 1) / charCount;
      stops.push({ offset: leftEdge, color: effectiveColors[i].hex });
      stops.push({ offset: rightEdge - 0.0001, color: effectiveColors[i].hex });
    }
    return stops;
  }

  // Bleed mode: place a stop at the center of each character's region.
  // The Canvas linear gradient naturally interpolates between them,
  // and the bleed parameter controls how wide each center region is
  // (wider = less bleeding, narrower = more bleeding).
  for (let i = 0; i < charCount; i++) {
    const center = (i + 0.5) / charCount;
    const regionWidth = 1 / charCount;
    // At bleed=1, stops are exactly at center (maximum gradient smoothness).
    // At bleed=0.01, stops spread to near-edges (almost sharp).
    const halfSpread = regionWidth * 0.5 * (1 - bleed);

    if (halfSpread > 0.001) {
      stops.push({
        offset: clampOffset(center - halfSpread),
        color: effectiveColors[i].hex,
      });
      stops.push({
        offset: clampOffset(center + halfSpread),
        color: effectiveColors[i].hex,
      });
    } else {
      stops.push({ offset: clampOffset(center), color: effectiveColors[i].hex });
    }
  }

  return stops;
}

function clampOffset(v: number): number {
  return Math.max(0, Math.min(1, v));
}
