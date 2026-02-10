import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SynesthesiaState, Profile } from '../types';
import { DEFAULT_COLOR_MAP } from '../constants/defaultColorMap';

export const useSynesthesiaStore = create<SynesthesiaState>()(
  persist(
    (set, get) => ({
      text: '',
      colorMap: { ...DEFAULT_COLOR_MAP },
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
        set((state) => ({
          colorMap: { ...state.colorMap, [char.toLowerCase()]: color },
        })),

      setBleed: (bleed) =>
        set((state) => ({
          gradientSettings: { ...state.gradientSettings, bleed },
        })),

      setWordMix: (wordMix) =>
        set((state) => ({
          gradientSettings: { ...state.gradientSettings, wordMix },
        })),

      createProfile: (name) => {
        const state = get();
        const newProfile: Profile = {
          id: crypto.randomUUID(),
          name,
          colorMap: { ...state.colorMap },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({
          profiles: [...s.profiles, newProfile],
          activeProfileId: newProfile.id,
        }));
      },

      loadProfile: (profileId) => {
        const profile = get().profiles.find((p) => p.id === profileId);
        if (profile) {
          set({ colorMap: { ...profile.colorMap }, activeProfileId: profileId });
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
                ? { ...p, colorMap: { ...state.colorMap }, updatedAt: new Date().toISOString() }
                : p,
            ),
          };
        }),

      openVariantModal: (char, color, position) =>
        set({
          variantModal: {
            isOpen: true,
            character: char,
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
