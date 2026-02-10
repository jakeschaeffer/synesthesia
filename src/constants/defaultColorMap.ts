import type { ColorMap } from '../types';
import { hexToSynColor } from '../utils/colorUtils';

const DEFAULT_HEX_BY_CHAR: Record<string, string> = {
  a: '#ff5fa2',
  b: '#1f6feb',
  c: '#f6c945',
  d: '#8b5e34',
  e: '#2da44e',
  f: '#8b5e34',
  g: '#2da44e',
  h: '#7b61a3',
  i: '#ffffff',
  j: '#7a8a7a',
  k: '#6f2dbd',
  l: '#f6c945',
  m: '#d1242f',
  n: '#f6c945',
  o: '#ffffff',
  p: '#6f2dbd',
  q: '#8a8f98',
  r: '#d1242f',
  s: '#bdbdbd',
  t: '#1f6feb',
  u: '#ffffff',
  v: '#bdbdbd',
  w: '#d1242f',
  x: '#4b0082',
  y: '#f6c945',
  z: '#5a7896',
  0: '#ffffff',
  1: '#ffffff',
  2: '#2da44e',
  3: '#6f2dbd',
  4: '#7c3aed',
  5: '#f28c28',
  6: '#1f6feb',
  7: '#f6c945',
  8: '#8b5e34',
  9: '#000000',
};

function buildDefaultColorMap(): ColorMap {
  return Object.entries(DEFAULT_HEX_BY_CHAR).reduce<ColorMap>((map, [char, hex]) => {
    map[char] = hexToSynColor(hex);
    return map;
  }, {});
}

export const DEFAULT_COLOR_MAP: ColorMap = buildDefaultColorMap();
