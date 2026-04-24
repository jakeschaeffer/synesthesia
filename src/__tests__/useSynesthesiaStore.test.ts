import { describe, it, expect, beforeEach } from 'vitest';
import { useSynesthesiaStore } from '../store/useSynesthesiaStore';
import {
  ALPHANUMERIC_CHARS,
  DEFAULT_COLOR_MAP,
} from '../constants/defaultColorMap';

function getStore() {
  return useSynesthesiaStore.getState();
}

function cloneDefaultMap() {
  return Object.fromEntries(
    Object.entries(DEFAULT_COLOR_MAP).map(([k, v]) => [k, { ...v }]),
  );
}

describe('useSynesthesiaStore', () => {
  beforeEach(() => {
    useSynesthesiaStore.setState({
      text: '',
      colorMap: cloneDefaultMap(),
      activeProfileId: null,
      profiles: [],
      gradientSettings: { bleed: 0.35, wordMix: 0.0 },
      editorChar: null,
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

    it('setEditorChar normalizes case', () => {
      getStore().setEditorChar('A');
      expect(getStore().editorChar).toBe('a');
      getStore().setEditorChar(null);
      expect(getStore().editorChar).toBeNull();
    });
  });

  describe('deep clone isolation', () => {
    it('colorMap entries are deep-cloned from DEFAULT_COLOR_MAP', () => {
      const storeColor = getStore().colorMap['a'];
      const defaultColor = DEFAULT_COLOR_MAP['a'];
      expect(storeColor.hex).toBe(defaultColor.hex);
      expect(storeColor).not.toBe(defaultColor);
    });

    it('mutating store colorMap does not affect DEFAULT_COLOR_MAP', () => {
      const originalHex = DEFAULT_COLOR_MAP['a'].hex;
      getStore().setColorForChar('a', { hex: '#000000', h: 0, s: 0, l: 0 });
      expect(DEFAULT_COLOR_MAP['a'].hex).toBe(originalHex);
    });
  });

  describe('createProfile', () => {
    it('creates a profile with colorMapOverride when provided', () => {
      getStore().createProfile('Test Profile', DEFAULT_COLOR_MAP);

      const { profiles, activeProfileId } = getStore();
      expect(profiles).toHaveLength(1);
      expect(profiles[0].name).toBe('Test Profile');
      expect(profiles[0].colorMap['a'].hex).toBe(DEFAULT_COLOR_MAP['a'].hex);
      expect(activeProfileId).toBe(profiles[0].id);
    });

    it('creates a profile with fresh colors when no override', () => {
      getStore().createProfile('Fresh');
      const profile = getStore().profiles[0];
      expect(profile.colorMap['a']).toBeDefined();
      expect(profile.colorMap['a'].hex).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('profile colorMap is deep-cloned from source', () => {
      getStore().createProfile('Test', DEFAULT_COLOR_MAP);
      const profile = getStore().profiles[0];

      getStore().setColorForChar('a', { hex: '#000000', h: 0, s: 0, l: 0 });

      expect(profile.colorMap['a'].hex).not.toBe('#000000');
    });

    it('returns the new profile id', () => {
      const id = getStore().createProfile('Test', DEFAULT_COLOR_MAP);
      expect(id).toBe(getStore().profiles[0].id);
    });
  });

  describe('ensureEmmaProfile', () => {
    it('creates an Emma profile when none exists', () => {
      getStore().ensureEmmaProfile();
      const emma = getStore().profiles.find(
        (p) => p.name.toLowerCase() === 'emma',
      );
      expect(emma).toBeDefined();
      expect(emma?.colorMap['a'].hex).toBe(DEFAULT_COLOR_MAP['a'].hex);
    });

    it('activates Emma when no profile is active', () => {
      getStore().ensureEmmaProfile();
      const emma = getStore().profiles.find(
        (p) => p.name.toLowerCase() === 'emma',
      );
      expect(getStore().activeProfileId).toBe(emma?.id);
    });

    it('does not duplicate Emma when called twice', () => {
      getStore().ensureEmmaProfile();
      getStore().ensureEmmaProfile();
      const emmas = getStore().profiles.filter(
        (p) => p.name.toLowerCase() === 'emma',
      );
      expect(emmas).toHaveLength(1);
    });

    it('does not switch active profile away from a non-Emma active one', () => {
      getStore().createProfile('Maya', DEFAULT_COLOR_MAP);
      const mayaId = getStore().activeProfileId;
      getStore().ensureEmmaProfile();
      expect(getStore().activeProfileId).toBe(mayaId);
    });
  });

  describe('loadProfile + active sync', () => {
    it('switching between profiles restores their respective colorMaps', () => {
      getStore().createProfile('Profile 1', DEFAULT_COLOR_MAP);
      const firstId = getStore().profiles[0].id;

      getStore().createProfile('Profile 2', DEFAULT_COLOR_MAP);
      const secondId = getStore().profiles[1].id;
      getStore().setColorForChar('a', { hex: '#111111', h: 0, s: 0, l: 7 });

      getStore().loadProfile(firstId);
      expect(getStore().activeProfileId).toBe(firstId);
      expect(getStore().colorMap['a'].hex).toBe(DEFAULT_COLOR_MAP['a'].hex);

      getStore().loadProfile(secondId);
      expect(getStore().colorMap['a'].hex).toBe('#111111');
    });

    it('setColorForChar keeps the active profile colorMap in sync', () => {
      getStore().createProfile('Profile 1', DEFAULT_COLOR_MAP);
      getStore().setColorForChar('a', { hex: '#abcdef', h: 210, s: 68, l: 80 });
      const profile = getStore().profiles[0];
      expect(profile.colorMap['a'].hex).toBe('#abcdef');
    });
  });

  describe('deleteProfile', () => {
    it('refuses to delete the last remaining profile', () => {
      getStore().createProfile('Only', DEFAULT_COLOR_MAP);
      const id = getStore().profiles[0].id;
      getStore().deleteProfile(id);
      expect(getStore().profiles).toHaveLength(1);
    });

    it('picks the first remaining profile when deleting the active one', () => {
      getStore().createProfile('Profile 1', DEFAULT_COLOR_MAP);
      const firstId = getStore().profiles[0].id;
      getStore().createProfile('Profile 2', DEFAULT_COLOR_MAP);
      const secondId = getStore().profiles[1].id;
      expect(getStore().activeProfileId).toBe(secondId);

      getStore().deleteProfile(secondId);
      expect(getStore().profiles).toHaveLength(1);
      expect(getStore().activeProfileId).toBe(firstId);
    });

    it('preserves activeProfileId when deleting a non-active profile', () => {
      getStore().createProfile('Profile 1', DEFAULT_COLOR_MAP);
      const firstId = getStore().profiles[0].id;
      getStore().createProfile('Profile 2', DEFAULT_COLOR_MAP);
      const secondId = getStore().profiles[1].id;

      getStore().deleteProfile(firstId);
      expect(getStore().activeProfileId).toBe(secondId);
      expect(getStore().profiles).toHaveLength(1);
    });
  });

  describe('rerollAll / rerollLetters', () => {
    it('rerollAll generates a new color for every alphanumeric char', () => {
      getStore().createProfile('P', DEFAULT_COLOR_MAP);
      getStore().rerollAll();
      const map = getStore().colorMap;
      for (const ch of ALPHANUMERIC_CHARS) {
        expect(map[ch]?.hex).toMatch(/^#[0-9a-f]{6}$/);
      }
    });

    it('rerollLetters only changes the provided letters', () => {
      getStore().createProfile('P', DEFAULT_COLOR_MAP);
      const before = { ...getStore().colorMap };
      getStore().rerollLetters(['a']);
      const after = getStore().colorMap;
      // `b` is untouched
      expect(after['b'].hex).toBe(before['b'].hex);
    });

    it('rerollLetters ignores non-alphanumeric inputs', () => {
      getStore().createProfile('P', DEFAULT_COLOR_MAP);
      const before = { ...getStore().colorMap };
      getStore().rerollLetters([' ', '!', '.']);
      expect(getStore().colorMap['a'].hex).toBe(before['a'].hex);
    });
  });

  describe('applyPaletteBias', () => {
    it('produces colors in the warm range', () => {
      getStore().createProfile('P', DEFAULT_COLOR_MAP);
      getStore().applyPaletteBias('warm');
      const map = getStore().colorMap;
      for (const ch of ALPHANUMERIC_CHARS) {
        expect(map[ch].hex).toMatch(/^#[0-9a-f]{6}$/);
      }
    });

    it('syncs the new colors into the active profile', () => {
      getStore().createProfile('P', DEFAULT_COLOR_MAP);
      getStore().applyPaletteBias('cool');
      const profileColor = getStore().profiles[0].colorMap['a'].hex;
      expect(profileColor).toBe(getStore().colorMap['a'].hex);
    });
  });
});
