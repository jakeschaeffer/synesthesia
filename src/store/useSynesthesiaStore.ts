import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ColorMap, Profile, SynesthesiaState } from '../types';
import {
  ALPHANUMERIC_CHARS,
  DEFAULT_COLOR_MAP,
} from '../constants/defaultColorMap';
import { freshColorMap, paletteBiasColor } from '../utils/palettes';
import { hexToSynColor } from '../utils/colorUtils';

function cloneColorMap(map: ColorMap): ColorMap {
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => [key, { ...value }]),
  );
}

function applyToActiveProfile(
  profiles: Profile[],
  activeProfileId: string | null,
  colors: ColorMap,
): Profile[] {
  if (!activeProfileId) return profiles;
  return profiles.map((profile) =>
    profile.id === activeProfileId
      ? {
          ...profile,
          colorMap: cloneColorMap(colors),
          updatedAt: new Date().toISOString(),
        }
      : profile,
  );
}

export const useSynesthesiaStore = create<SynesthesiaState>()(
  persist(
    (set, get) => ({
      text: '',
      colorMap: cloneColorMap(DEFAULT_COLOR_MAP),
      activeProfileId: null,
      profiles: [],
      gradientSettings: { bleed: 0.35, wordMix: 0.0 },
      editorChar: null,

      setText: (text) => set({ text }),

      setColorForChar: (char, color) =>
        set((state) => {
          const normalized = char.toLowerCase();
          const nextColors = { ...state.colorMap, [normalized]: color };
          return {
            colorMap: nextColors,
            profiles: applyToActiveProfile(
              state.profiles,
              state.activeProfileId,
              nextColors,
            ),
          };
        }),

      setBleed: (bleed) =>
        set((state) => ({
          gradientSettings: { ...state.gradientSettings, bleed },
        })),

      setWordMix: (wordMix) =>
        set((state) => ({
          gradientSettings: { ...state.gradientSettings, wordMix },
        })),

      createProfile: (name, colorMapOverride) => {
        const profileColors = colorMapOverride
          ? cloneColorMap(colorMapOverride)
          : freshColorMap();
        const now = new Date().toISOString();
        const newProfile: Profile = {
          id: crypto.randomUUID(),
          name: name.slice(0, 40),
          colorMap: profileColors,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          profiles: [...s.profiles, newProfile],
          activeProfileId: newProfile.id,
          colorMap: cloneColorMap(profileColors),
          editorChar: null,
        }));
        return newProfile.id;
      },

      ensureEmmaProfile: () =>
        set((state) => {
          const existingEmma = state.profiles.find(
            (profile) => profile.name.trim().toLowerCase() === 'emma',
          );

          const now = new Date().toISOString();
          let nextProfiles = state.profiles;
          let emma = existingEmma;
          if (!emma) {
            emma = {
              id: crypto.randomUUID(),
              name: 'Emma',
              colorMap: cloneColorMap(DEFAULT_COLOR_MAP),
              createdAt: now,
              updatedAt: now,
            };
            nextProfiles = [...state.profiles, emma];
          }

          if (!state.activeProfileId) {
            return {
              profiles: nextProfiles,
              activeProfileId: emma.id,
              colorMap: cloneColorMap(emma.colorMap),
            };
          }

          return nextProfiles === state.profiles
            ? state
            : { profiles: nextProfiles };
        }),

      renameProfile: (profileId, name) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === profileId ? { ...p, name: name.slice(0, 40) } : p,
          ),
        })),

      loadProfile: (profileId) => {
        const profile = get().profiles.find((p) => p.id === profileId);
        if (!profile) return;
        set({
          colorMap: cloneColorMap(profile.colorMap),
          activeProfileId: profileId,
          editorChar: null,
        });
      },

      deleteProfile: (profileId) =>
        set((state) => {
          if (state.profiles.length <= 1) return state;
          const remaining = state.profiles.filter((p) => p.id !== profileId);
          if (state.activeProfileId !== profileId) {
            return { profiles: remaining };
          }
          const next = remaining[0];
          return {
            profiles: remaining,
            activeProfileId: next.id,
            colorMap: cloneColorMap(next.colorMap),
            editorChar: null,
          };
        }),

      rerollAll: () =>
        set((state) => {
          const next = freshColorMap();
          return {
            colorMap: next,
            profiles: applyToActiveProfile(
              state.profiles,
              state.activeProfileId,
              next,
            ),
          };
        }),

      rerollLetters: (letters) =>
        set((state) => {
          const normalized = new Set(
            letters
              .map((ch) => ch.toLowerCase())
              .filter((ch) => /[a-z0-9]/.test(ch)),
          );
          if (normalized.size === 0) return state;
          const next = { ...state.colorMap };
          const fresh = freshColorMap();
          normalized.forEach((ch) => {
            next[ch] = fresh[ch] ?? next[ch];
          });
          return {
            colorMap: next,
            profiles: applyToActiveProfile(
              state.profiles,
              state.activeProfileId,
              next,
            ),
          };
        }),

      applyPaletteBias: (bias) =>
        set((state) => {
          const next: ColorMap = {};
          ALPHANUMERIC_CHARS.forEach((ch) => {
            next[ch] = hexToSynColor(paletteBiasColor(bias));
          });
          return {
            colorMap: next,
            profiles: applyToActiveProfile(
              state.profiles,
              state.activeProfileId,
              next,
            ),
          };
        }),

      setEditorChar: (char) =>
        set({ editorChar: char ? char.toLowerCase() : null }),
    }),
    {
      name: 'synesthesia-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        colorMap: state.colorMap,
        gradientSettings: state.gradientSettings,
      }),
    },
  ),
);
