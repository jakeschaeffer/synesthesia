import { describe, it, expect, beforeEach } from 'vitest';
import { useSynesthesiaStore } from '../store/useSynesthesiaStore';
import { DEFAULT_COLOR_MAP } from '../constants/defaultColorMap';

function getStore() {
  return useSynesthesiaStore.getState();
}

describe('useSynesthesiaStore', () => {
  beforeEach(() => {
    // Reset store to defaults before each test
    useSynesthesiaStore.setState({
      text: '',
      colorMap: Object.fromEntries(
        Object.entries(DEFAULT_COLOR_MAP).map(([k, v]) => [k, { ...v }]),
      ),
      activeProfileId: null,
      profiles: [],
      gradientSettings: { bleed: 0.5, wordMix: 0.0 },
      variantModal: {
        isOpen: false,
        character: null,
        currentColor: null,
        anchorPosition: null,
      },
    });
  });

  describe('basic setters', () => {
    it('setText updates text', () => {
      getStore().setText('hello');
      expect(getStore().text).toBe('hello');
    });

    it('setBleed updates gradientSettings.bleed', () => {
      getStore().setBleed(0.8);
      expect(getStore().gradientSettings.bleed).toBe(0.8);
    });

    it('setWordMix updates gradientSettings.wordMix', () => {
      getStore().setWordMix(0.6);
      expect(getStore().gradientSettings.wordMix).toBe(0.6);
    });
  });

  describe('deep clone isolation', () => {
    it('colorMap entries are deep-cloned from DEFAULT_COLOR_MAP', () => {
      const storeColor = getStore().colorMap['a'];
      const defaultColor = DEFAULT_COLOR_MAP['a'];
      // Should have the same values
      expect(storeColor.hex).toBe(defaultColor.hex);
      // But be different object references
      expect(storeColor).not.toBe(defaultColor);
    });

    it('mutating store colorMap does not affect DEFAULT_COLOR_MAP', () => {
      const originalHex = DEFAULT_COLOR_MAP['a'].hex;
      getStore().setColorForChar('a', { hex: '#000000', h: 0, s: 0, l: 0 });
      expect(DEFAULT_COLOR_MAP['a'].hex).toBe(originalHex);
    });
  });

  describe('createProfile', () => {
    it('creates a profile with current colorMap when no override provided', () => {
      getStore().setColorForChar('a', { hex: '#ff0000', h: 0, s: 100, l: 50 });
      getStore().createProfile('Test Profile');

      const { profiles, activeProfileId } = getStore();
      expect(profiles).toHaveLength(1);
      expect(profiles[0].name).toBe('Test Profile');
      expect(profiles[0].colorMap['a'].hex).toBe('#ff0000');
      expect(activeProfileId).toBe(profiles[0].id);
    });

    it('creates a profile with colorMapOverride when provided', () => {
      getStore().setColorForChar('a', { hex: '#ff0000', h: 0, s: 100, l: 50 });
      getStore().createProfile('Rainbow Profile', DEFAULT_COLOR_MAP);

      const { profiles } = getStore();
      expect(profiles[0].colorMap['a'].hex).toBe(DEFAULT_COLOR_MAP['a'].hex);
      // Active colorMap should also be updated to the override
      expect(getStore().colorMap['a'].hex).toBe(DEFAULT_COLOR_MAP['a'].hex);
    });

    it('profile colorMap is deep-cloned from source', () => {
      getStore().createProfile('Test');
      const profile = getStore().profiles[0];

      // Mutate the active colorMap
      getStore().setColorForChar('a', { hex: '#000000', h: 0, s: 0, l: 0 });

      // Profile should still have the original color
      expect(profile.colorMap['a'].hex).not.toBe('#000000');
    });
  });

  describe('loadProfile', () => {
    it('loads profile colorMap and sets activeProfileId', () => {
      getStore().createProfile('Profile 1');
      const profileId = getStore().profiles[0].id;
      const profileColor = getStore().profiles[0].colorMap['a'].hex;

      // Change the active color
      getStore().setColorForChar('a', { hex: '#111111', h: 0, s: 0, l: 7 });

      // Load the profile
      getStore().loadProfile(profileId);
      expect(getStore().activeProfileId).toBe(profileId);
      expect(getStore().colorMap['a'].hex).toBe(profileColor);
    });

    it('loaded colorMap is deep-cloned from profile', () => {
      getStore().createProfile('Profile 1');
      const profileId = getStore().profiles[0].id;

      getStore().loadProfile(profileId);

      // Mutate the active colorMap
      getStore().setColorForChar('a', { hex: '#999999', h: 0, s: 0, l: 60 });

      // Profile's stored colorMap should be unchanged
      const profile = getStore().profiles.find((p) => p.id === profileId)!;
      expect(profile.colorMap['a'].hex).not.toBe('#999999');
    });
  });

  describe('updateActiveProfile', () => {
    it('updates the active profile with current colorMap', () => {
      getStore().createProfile('Profile 1');
      const profileId = getStore().profiles[0].id;

      getStore().setColorForChar('a', { hex: '#abcdef', h: 210, s: 68, l: 80 });
      getStore().updateActiveProfile();

      const profile = getStore().profiles.find((p) => p.id === profileId)!;
      expect(profile.colorMap['a'].hex).toBe('#abcdef');
    });

    it('does nothing when no active profile', () => {
      useSynesthesiaStore.setState({ activeProfileId: null });
      const profilesBefore = getStore().profiles;
      getStore().updateActiveProfile();
      expect(getStore().profiles).toBe(profilesBefore);
    });

    it('updated profile colorMap is deep-cloned', () => {
      getStore().createProfile('Profile 1');

      getStore().setColorForChar('a', { hex: '#abcdef', h: 210, s: 68, l: 80 });
      getStore().updateActiveProfile();

      // Now mutate the active colorMap again
      getStore().setColorForChar('a', { hex: '#000000', h: 0, s: 0, l: 0 });

      // Profile should still have the saved value
      const profile = getStore().profiles[0];
      expect(profile.colorMap['a'].hex).toBe('#abcdef');
    });
  });

  describe('deleteProfile', () => {
    it('removes the profile from the list', () => {
      getStore().createProfile('Profile 1');
      const profileId = getStore().profiles[0].id;

      getStore().deleteProfile(profileId);
      expect(getStore().profiles).toHaveLength(0);
    });

    it('resets activeProfileId when deleting the active profile', () => {
      getStore().createProfile('Profile 1');
      const profileId = getStore().profiles[0].id;
      expect(getStore().activeProfileId).toBe(profileId);

      getStore().deleteProfile(profileId);
      expect(getStore().activeProfileId).toBeNull();
    });

    it('preserves activeProfileId when deleting a non-active profile', () => {
      getStore().createProfile('Profile 1');
      const firstId = getStore().profiles[0].id;

      getStore().createProfile('Profile 2');
      const secondId = getStore().profiles[1].id;
      // activeProfileId is now secondId (most recently created)

      getStore().deleteProfile(firstId);
      expect(getStore().activeProfileId).toBe(secondId);
      expect(getStore().profiles).toHaveLength(1);
    });
  });
});
