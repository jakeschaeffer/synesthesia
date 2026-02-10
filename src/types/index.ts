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

export interface VariantModalState {
  isOpen: boolean;
  character: string | null;
  currentColor: SynColor | null;
  anchorPosition: { x: number; y: number } | null;
}

export interface GradientStop {
  offset: number;
  color: string;
}

export interface SynesthesiaState {
  text: string;
  colorMap: ColorMap;
  activeProfileId: string | null;
  profiles: Profile[];
  gradientSettings: GradientSettings;
  variantModal: VariantModalState;

  setText: (text: string) => void;
  setColorForChar: (char: string, color: SynColor) => void;
  setBleed: (bleed: number) => void;
  setWordMix: (wordMix: number) => void;
  createProfile: (name: string) => void;
  loadProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  updateActiveProfile: () => void;
  openVariantModal: (char: string, color: SynColor, position: { x: number; y: number }) => void;
  closeVariantModal: () => void;
}
