import { formatHex } from 'culori';
import type { Oklch } from 'culori';
import type { ColorMap } from '../types';
import { hexToSynColor } from '../utils/colorUtils';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';

function buildRainbowMap(): ColorMap {
  const map: ColorMap = {};
  const allChars = LETTERS + DIGITS;
  const total = allChars.length;

  for (let i = 0; i < total; i++) {
    const hue = (i / total) * 360;
    const color: Oklch = { mode: 'oklch', l: 0.7, c: 0.15, h: hue };
    const hex = formatHex(color) ?? '#808080';
    map[allChars[i]] = hexToSynColor(hex);
  }

  return map;
}

export const DEFAULT_COLOR_MAP: ColorMap = buildRainbowMap();
