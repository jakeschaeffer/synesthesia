import {
  ALPHANUMERIC_CHARS,
} from '../constants/defaultColorMap';
import type { ColorMap, SynColor } from '../types';
import { hexToSynColor } from './colorUtils';

const PROFILE_EXPORT_FORMAT = 'synesthesia-profile-v1';

interface ExportProfilePayloadV1 {
  format: typeof PROFILE_EXPORT_FORMAT;
  exportedAt: string;
  profile: {
    name: string;
    legend: Record<string, SynColor | null>;
  };
}

interface ImportResult {
  profileName: string;
  colorMap: ColorMap;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeHex(input: string): string | null {
  const value = input.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

function toSynColor(value: unknown): SynColor | null {
  if (typeof value === 'string') {
    const normalizedHex = normalizeHex(value);
    return normalizedHex ? hexToSynColor(normalizedHex) : null;
  }

  if (!isRecord(value)) return null;

  if (value.hex && typeof value.hex === 'string') {
    const normalizedHex = normalizeHex(value.hex);
    return normalizedHex ? hexToSynColor(normalizedHex) : null;
  }

  return null;
}

function buildColorMapFromLegendInput(input: UnknownRecord): ColorMap {
  const colorMap: ColorMap = {};

  for (const char of ALPHANUMERIC_CHARS) {
    const direct = input[char];
    const upper = input[char.toUpperCase()];
    const color = toSynColor(direct ?? upper);
    if (color) colorMap[char] = color;
  }

  return colorMap;
}

function hasLegendLikeKeys(input: UnknownRecord): boolean {
  return ALPHANUMERIC_CHARS.some(
    (char) => char in input || char.toUpperCase() in input,
  );
}

export function buildProfileExportPayload(
  profileName: string,
  colorMap: ColorMap,
): ExportProfilePayloadV1 {
  const legend = ALPHANUMERIC_CHARS.reduce<Record<string, SynColor | null>>(
    (acc, char) => {
      acc[char] = colorMap[char] ? { ...colorMap[char] } : null;
      return acc;
    },
    {},
  );

  return {
    format: PROFILE_EXPORT_FORMAT,
    exportedAt: new Date().toISOString(),
    profile: {
      name: profileName,
      legend,
    },
  };
}

export function serializeProfileExport(
  profileName: string,
  colorMap: ColorMap,
): string {
  return JSON.stringify(buildProfileExportPayload(profileName, colorMap), null, 2);
}

export function parseProfileImport(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON file.');
  }

  if (!isRecord(parsed)) {
    throw new Error('Import must be a JSON object.');
  }

  if (parsed.format === PROFILE_EXPORT_FORMAT && isRecord(parsed.profile)) {
    const profile = parsed.profile;
    if (!isRecord(profile.legend)) {
      throw new Error('Export JSON missing profile.legend.');
    }

    const name =
      typeof profile.name === 'string' && profile.name.trim().length > 0
        ? profile.name.trim()
        : 'Imported Profile';
    return {
      profileName: name,
      colorMap: buildColorMapFromLegendInput(profile.legend),
    };
  }

  if (isRecord(parsed.colorMap)) {
    const name =
      typeof parsed.name === 'string' && parsed.name.trim().length > 0
        ? parsed.name.trim()
        : 'Imported Profile';
    return {
      profileName: name,
      colorMap: buildColorMapFromLegendInput(parsed.colorMap),
    };
  }

  if (hasLegendLikeKeys(parsed)) {
    return {
      profileName: 'Imported Profile',
      colorMap: buildColorMapFromLegendInput(parsed),
    };
  }

  throw new Error('Unsupported profile JSON format.');
}
