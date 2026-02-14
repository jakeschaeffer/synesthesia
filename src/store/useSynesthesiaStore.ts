import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SynesthesiaState, Profile, ColorMap } from '../types';
import { DEFAULT_COLOR_MAP, buildRainbowColorMap } from '../constants/defaultColorMap';

function cloneColorMap(map: ColorMap): ColorMap {
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => [key, { ...value }]),
  );
}

export const useSynesthesiaStore = create<SynesthesiaState>()(
  persist(
    (set, get) => ({
      text: '',
      colorMap: cloneColorMap(DEFAULT_COLOR_MAP),
      activeProfileId: null,
      profiles: [],
      gradientSettings: { bleed: 0.5, wordMix: 0.0 },
      variantModal: {
        isOpen: false,
        character: null,
        currentColor: null,
        anchorPosition: null,
      },

      setText: (text) => set({ text }),

      setColorForChar: (char, color) =>
        set((state) => {
          const normalized = char.toLowerCase();
          const shouldSyncVariantModal =
            state.variantModal.isOpen && state.variantModal.character === normalized;

          return {
            colorMap: { ...state.colorMap, [normalized]: color },
            variantModal: shouldSyncVariantModal
              ? { ...state.variantModal, currentColor: color }
              : state.variantModal,
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
        const profileColors: ColorMap = colorMapOverride
          ? cloneColorMap(colorMapOverride)
          : {};
        const newProfile: Profile = {
          id: crypto.randomUUID(),
          name,
          colorMap: profileColors,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({
          profiles: [...s.profiles, newProfile],
          activeProfileId: newProfile.id,
          colorMap: cloneColorMap(profileColors),
        }));
      },

      ensureEmmaProfile: () =>
        set((state) => {
          const hasEmma = state.profiles.some(
            (profile) => profile.name.trim().toLowerCase() === 'emma',
          );
          if (hasEmma) return state;

          const now = new Date().toISOString();
          const emmaProfile: Profile = {
            id: crypto.randomUUID(),
            name: 'Emma',
            colorMap: { ...DEFAULT_COLOR_MAP },
            createdAt: now,
            updatedAt: now,
          };

          return {
            profiles: [...state.profiles, emmaProfile],
          };
        }),

      assignRainbowColorMap: () =>
        set((state) => {
          const rainbow = buildRainbowColorMap();

          if (!state.activeProfileId) {
            return { colorMap: { ...rainbow } };
          }

          return {
            colorMap: { ...rainbow },
            profiles: state.profiles.map((profile) =>
              profile.id === state.activeProfileId
                ? {
                    ...profile,
                    colorMap: { ...rainbow },
                    updatedAt: new Date().toISOString(),
                  }
                : profile,
            ),
          };
        }),

      loadProfile: (profileId) => {
        const profile = get().profiles.find((p) => p.id === profileId);
        if (profile) {
          set({ colorMap: cloneColorMap(profile.colorMap), activeProfileId: profileId });
        }
      },

      deleteProfile: (profileId) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== profileId),
          activeProfileId:
            state.activeProfileId === profileId ? null : state.activeProfileId,
        })),

      updateActiveProfile: () =>
        set((state) => {
          if (!state.activeProfileId) return state;
          return {
            profiles: state.profiles.map((p) =>
              p.id === state.activeProfileId
                ? {
                    ...p,
                    colorMap: cloneColorMap(state.colorMap),
                    updatedAt: new Date().toISOString(),
                  }
                : p,
            ),
          };
        }),

      openVariantModal: (char, color, position) =>
        set({
          variantModal: {
            isOpen: true,
            character: char.toLowerCase(),
            currentColor: color,
            anchorPosition: position,
          },
        }),

      closeVariantModal: () =>
        set({
          variantModal: {
            isOpen: false,
            character: null,
            currentColor: null,
            anchorPosition: null,
          },
        }),
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
