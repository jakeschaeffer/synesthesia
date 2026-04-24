import type { ColorMap, PaletteBias } from '../types';
import { ALPHANUMERIC_CHARS } from '../constants/defaultColorMap';
import { hexToSynColor, hslToHex } from './colorUtils';

interface RandomColorOptions {
  hRange?: [number, number];
  sRange?: [number, number];
  lRange?: [number, number];
}

export function randomHex(options: RandomColorOptions = {}): string {
  const { hRange = [0, 360], sRange = [55, 92], lRange = [35, 68] } = options;
  const h = Math.floor(hRange[0] + Math.random() * (hRange[1] - hRange[0]));
  const s = Math.floor(sRange[0] + Math.random() * (sRange[1] - sRange[0]));
  const l = Math.floor(lRange[0] + Math.random() * (lRange[1] - lRange[0]));
  return hslToHex(h, s, l);
}

export function freshColorMap(): ColorMap {
  const fresh: ColorMap = {};
  const total = ALPHANUMERIC_CHARS.length;
  const offset = Math.random() * 360;

  ALPHANUMERIC_CHARS.forEach((ch, i) => {
    const useWheel = Math.random() < 0.72;
    let hex: string;
    if (useWheel) {
      const h = (offset + (i / total) * 720 + Math.random() * 40) % 360;
      const s = 60 + Math.random() * 30;
      const l = 38 + Math.random() * 28;
      hex = hslToHex(h, s, l);
    } else {
      hex = randomHex();
    }
    fresh[ch] = hexToSynColor(hex);
  });

  return fresh;
}

export function paletteBiasColor(bias: PaletteBias): string {
  switch (bias) {
    case 'warm': {
      const pick = Math.random();
      const h =
        pick < 0.7
          ? Math.floor(Math.random() * 80)
          : Math.floor(330 + Math.random() * 30);
      return hslToHex(h, 55 + Math.random() * 35, 40 + Math.random() * 22);
    }
    case 'cool': {
      const h = 160 + Math.floor(Math.random() * 120);
      return hslToHex(h, 45 + Math.random() * 40, 38 + Math.random() * 26);
    }
    case 'candy':
      return randomHex({ sRange: [85, 100], lRange: [45, 60] });
    case 'faded':
      return randomHex({ sRange: [18, 40], lRange: [62, 82] });
  }
}

export function paletteBiasColorMap(bias: PaletteBias): ColorMap {
  const map: ColorMap = {};
  ALPHANUMERIC_CHARS.forEach((ch) => {
    map[ch] = hexToSynColor(paletteBiasColor(bias));
  });
  return map;
}
