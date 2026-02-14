import type { ColorMap } from '../types';
import { hexToSynColor } from '../utils/colorUtils';

const COLORS: Record<string, string> = {
  // Letters
  a: '#E8819A', // pink
  b: '#4A90D9', // blue
  c: '#F5D033', // yellow
  d: '#8B5E3C', // brown
  e: '#4CAF50', // green
  f: '#A0724E', // brown
  g: '#5DAD5E', // green
  h: '#7E6DAE', // greenish purple
  i: '#EAEAEA', // white
  j: '#8A9A7B', // greenish gray
  k: '#9C27B0', // purple
  l: '#F7D84A', // yellow
  m: '#E53935', // red
  n: '#F0E04A', // yellow
  o: '#F5F5F5', // white
  p: '#7B1FA2', // purple
  q: '#9E9E9E', // grayish
  r: '#D32F2F', // red
  s: '#A8A8A8', // neutral gray (unspecified)
  t: '#2196F3', // blue
  u: '#E0E0E0', // white
  v: '#B0B0B0', // neutral gray (unspecified)
  w: '#C62828', // red
  x: '#9446A8', // reddish blue / magenta
  y: '#FFEB3B', // yellow
  z: '#5E8E8E', // greenish purplish bluish / teal

  // Digits
  '0': '#C0C0C0', // neutral gray (unspecified)
  '1': '#F0F0F0', // white
  '2': '#43A047', // green
  '3': '#8E4EAA', // purple
  '4': '#7A3FAA', // purple
  '5': '#FF9800', // orange
  '6': '#1E88E5', // blue
  '7': '#FDD835', // yellow
  '8': '#B8B8B8', // neutral gray (unspecified)
  '9': '#A0A0A0', // neutral gray (unspecified)
};

function buildColorMap(): ColorMap {
  const map: ColorMap = {};
  for (const [char, hex] of Object.entries(COLORS)) {
    map[char] = hexToSynColor(hex);
  }
  return map;
}

export const DEFAULT_COLOR_MAP: ColorMap = buildColorMap();
