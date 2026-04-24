export interface SynColor {
  hex: string;
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export type ColorMap = Record<string, SynColor>;

export interface Profile {
  id: string;
  name: string;
  colorMap: ColorMap;
  createdAt: string;
  updatedAt: string;
}

export interface GradientSettings {
  /** 0 = sharp boundaries, 1 = maximum bleed between colors */
  bleed: number;
  /** 0 = pure letter colors, 1 = pure word-average color */
  wordMix: number;
}

export interface GradientStop {
  offset: number;
  color: string;
}

export type PaletteBias = 'warm' | 'cool' | 'candy' | 'faded';

export interface SynesthesiaState {
  text: string;
  colorMap: ColorMap;
  activeProfileId: string | null;
  profiles: Profile[];
  gradientSettings: GradientSettings;
  /** Character currently open in the Nudger editor. */
  editorChar: string | null;

  setText: (text: string) => void;
  setColorForChar: (char: string, color: SynColor) => void;
  setBleed: (bleed: number) => void;
  setWordMix: (wordMix: number) => void;
  createProfile: (name: string, colorMapOverride?: ColorMap) => string;
  ensureEmmaProfile: () => void;
  renameProfile: (profileId: string, name: string) => void;
  loadProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  rerollAll: () => void;
  rerollLetters: (letters: string[]) => void;
  applyPaletteBias: (bias: PaletteBias) => void;
  setEditorChar: (char: string | null) => void;
}
