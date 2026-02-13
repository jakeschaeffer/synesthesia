import { formatHex, converter } from 'culori';
import type { Oklch } from 'culori';
import type { SynColor } from '../types';

const toOklch = converter('oklch');
const toHsl = converter('hsl');

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

function makeOklch(l: number, c: number, h: number): Oklch {
  return { mode: 'oklch', l, c, h };
}

export function hexToSynColor(hex: string): SynColor {
  const hsl = toHsl(hex);
  return {
    hex,
    h: hsl?.h ?? 0,
    s: (hsl?.s ?? 0) * 100,
    l: (hsl?.l ?? 0) * 100,
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const hex = formatHex({
    mode: 'hsl',
    h: clamp(0, 360, h),
    s: clamp(0, 100, s) / 100,
    l: clamp(0, 100, l) / 100,
  });
  return hex ?? '#808080';
}

export function generateVariants(baseHex: string, count: number = 6): string[] {
  const base = toOklch(baseHex);
  if (!base) return [baseHex];

  const adjustments = [
    { l: 0, c: 0, h: 25 },
    { l: 0, c: 0, h: -25 },
    { l: 0.12, c: 0, h: 0 },
    { l: -0.12, c: 0, h: 0 },
    { l: 0, c: 0.07, h: 0 },
    { l: 0.06, c: -0.05, h: 12 },
  ];

  const variants: string[] = [];
  for (const adj of adjustments.slice(0, count)) {
    const variant = makeOklch(
      clamp(0, 1, (base.l ?? 0.5) + adj.l),
      clamp(0, 0.4, (base.c ?? 0.1) + adj.c),
      ((base.h ?? 0) + adj.h + 360) % 360,
    );
    const hex = formatHex(variant);
    variants.push(hex ?? baseHex);
  }

  return variants;
}

export function averageColors(colors: SynColor[]): SynColor {
  if (colors.length === 0) return { hex: '#808080', h: 0, s: 0, l: 50 };
  if (colors.length === 1) return colors[0];

  const oklchColors = colors.map((c) => toOklch(c.hex)).filter(Boolean);
  if (oklchColors.length === 0) return colors[0];

  let sumL = 0;
  let sumC = 0;
  let sumSinH = 0;
  let sumCosH = 0;

  for (const c of oklchColors) {
    sumL += c!.l ?? 0;
    sumC += c!.c ?? 0;
    const hRad = ((c!.h ?? 0) * Math.PI) / 180;
    sumSinH += Math.sin(hRad);
    sumCosH += Math.cos(hRad);
  }

  const n = oklchColors.length;
  const avgH = ((Math.atan2(sumSinH / n, sumCosH / n) * 180) / Math.PI + 360) % 360;
  const avgL = sumL / n;
  const avgC = sumC / n;

  const hex = formatHex(makeOklch(avgL, avgC, avgH));
  return hexToSynColor(hex ?? '#808080');
}

export function lerpColor(colorA: SynColor, colorB: SynColor, t: number): SynColor {
  if (t <= 0) return colorA;
  if (t >= 1) return colorB;

  const a = toOklch(colorA.hex);
  const b = toOklch(colorB.hex);
  if (!a || !b) return colorA;

  const hueA = a.h ?? 0;
  const hueB = b.h ?? 0;
  let hueDiff = hueB - hueA;
  if (hueDiff > 180) hueDiff -= 360;
  if (hueDiff < -180) hueDiff += 360;

  const blended = makeOklch(
    (a.l ?? 0) + t * ((b.l ?? 0) - (a.l ?? 0)),
    (a.c ?? 0) + t * ((b.c ?? 0) - (a.c ?? 0)),
    (hueA + t * hueDiff + 360) % 360,
  );

  const hex = formatHex(blended);
  return hexToSynColor(hex ?? colorA.hex);
}
