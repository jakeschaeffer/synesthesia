import type { ColorMap } from '../types';
import { ALPHANUMERIC_CHARS } from '../constants/defaultColorMap';
import { hexToSynColor } from './colorUtils';

const B64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function hexToBytes(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function bytesToB64(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    const n = (a << 16) | (b << 8) | c;
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63];
    if (i + 1 < bytes.length) out += B64[(n >> 6) & 63];
    if (i + 2 < bytes.length) out += B64[n & 63];
  }
  return out;
}

function b64ToBytes(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i += 4) {
    const a = B64.indexOf(s[i]);
    const b = B64.indexOf(s[i + 1]);
    const c = i + 2 < s.length ? B64.indexOf(s[i + 2]) : -1;
    const d = i + 3 < s.length ? B64.indexOf(s[i + 3]) : -1;
    const n =
      (a << 18) |
      (b << 12) |
      ((c < 0 ? 0 : c) << 6) |
      (d < 0 ? 0 : d);
    out.push((n >> 16) & 255);
    if (c >= 0) out.push((n >> 8) & 255);
    if (d >= 0) out.push(n & 255);
  }
  return out;
}

function bytesToHex(b: number[]): string {
  return (
    '#' +
    b
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toLowerCase()
  );
}

export function encodeProfileCode(name: string, colors: ColorMap): string {
  const bytes: number[] = [];
  ALPHANUMERIC_CHARS.forEach((ch) => {
    const hex = colors[ch]?.hex ?? '#888888';
    const [r, g, b] = hexToBytes(hex);
    bytes.push(r, g, b);
  });
  const cleanName = encodeURIComponent((name || 'shared').slice(0, 32));
  return 'p1~' + cleanName + '~' + bytesToB64(bytes);
}

export interface DecodedProfile {
  name: string;
  colorMap: ColorMap;
}

export function decodeProfileCode(code: string): DecodedProfile {
  if (!code.startsWith('p1~')) throw new Error('Not a profile code');
  const parts = code.split('~');
  if (parts.length < 3) throw new Error('Bad code');
  const name = decodeURIComponent(parts[1]);
  const bytes = b64ToBytes(parts.slice(2).join('~'));
  const need = ALPHANUMERIC_CHARS.length * 3;
  if (bytes.length < need) throw new Error('Code is too short');
  const map: ColorMap = {};
  ALPHANUMERIC_CHARS.forEach((ch, i) => {
    const hex = bytesToHex([bytes[i * 3], bytes[i * 3 + 1], bytes[i * 3 + 2]]);
    map[ch] = hexToSynColor(hex);
  });
  return { name, colorMap: map };
}

export function encodeWordCode(word: string, colors: ColorMap): string {
  const w = (word || '').toLowerCase();
  const used = [...new Set([...w].filter((c) => /[a-z0-9]/.test(c)))];
  const bytes: number[] = [];
  used.forEach((ch) => {
    const hex = colors[ch]?.hex ?? '#888888';
    const [r, g, b] = hexToBytes(hex);
    bytes.push(r, g, b);
  });
  return (
    'w1~' +
    encodeURIComponent(w.slice(0, 40)) +
    '~' +
    used.join('') +
    '~' +
    bytesToB64(bytes)
  );
}

export interface DecodedWord {
  word: string;
  colorMap: ColorMap;
}

export function decodeWordCode(code: string): DecodedWord {
  if (!code.startsWith('w1~')) throw new Error('Not a word code');
  const parts = code.split('~');
  if (parts.length < 4) throw new Error('Bad code');
  const word = decodeURIComponent(parts[1]);
  const keys = parts[2];
  const bytes = b64ToBytes(parts.slice(3).join('~'));
  const map: ColorMap = {};
  [...keys].forEach((ch, i) => {
    const hex = bytesToHex([bytes[i * 3], bytes[i * 3 + 1], bytes[i * 3 + 2]]);
    map[ch] = hexToSynColor(hex);
  });
  return { word, colorMap: map };
}

export function buildShareUrl(code: string): string {
  if (typeof window === 'undefined') return '#' + code;
  const base = window.location.href.split('#')[0];
  return base + '#' + code;
}

export function extractCode(input: string): string {
  const trimmed = (input || '').trim();
  if (!trimmed) return '';
  const hashIdx = trimmed.indexOf('#');
  if (hashIdx >= 0) return trimmed.slice(hashIdx + 1);
  return trimmed;
}
