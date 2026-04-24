import { useMemo, useRef, useState } from 'react';
import { Modal } from './Modal';
import { useSynesthesiaStore } from '../store/useSynesthesiaStore';
import type { PaletteBias } from '../types';
import { showToast } from '../hooks/useToast';
import { decodeProfileCode, extractCode } from '../utils/shareCodes';
import { parseProfileImport } from '../utils/profileTransfer';
import { freshColorMap, paletteBiasColorMap } from '../utils/palettes';

interface ProfileManagerModalProps {
  onClose: () => void;
}

const DOT_SAMPLE_CHARS = ['a', 'e', 'i', 'o', 's', 't', 'r', 'n'];
type ProfileSeed = 'fresh' | PaletteBias;

const PROFILE_SEED_OPTIONS: Array<{ id: ProfileSeed; label: string }> = [
  { id: 'fresh', label: 'Fresh Random' },
  { id: 'warm', label: 'Warm Bias' },
  { id: 'cool', label: 'Cool Bias' },
  { id: 'candy', label: 'High Saturation' },
  { id: 'faded', label: 'Faded / Pastel' },
];

export function ProfileManagerModal({ onClose }: ProfileManagerModalProps) {
  const profiles = useSynesthesiaStore((s) => s.profiles);
  const activeProfileId = useSynesthesiaStore((s) => s.activeProfileId);
  const loadProfile = useSynesthesiaStore((s) => s.loadProfile);
  const renameProfile = useSynesthesiaStore((s) => s.renameProfile);
  const deleteProfile = useSynesthesiaStore((s) => s.deleteProfile);
  const createProfile = useSynesthesiaStore((s) => s.createProfile);

  const [newName, setNewName] = useState('');
  const [newProfileSeed, setNewProfileSeed] = useState<ProfileSeed>('fresh');
  const [importCode, setImportCode] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedProfiles = useMemo(
    () => [...profiles].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)),
    [profiles],
  );

  const handleCreate = () => {
    const name = newName.trim() || 'New profile';
    const initialMap =
      newProfileSeed === 'fresh'
        ? freshColorMap()
        : paletteBiasColorMap(newProfileSeed);
    createProfile(name, initialMap);
    setNewName('');
    setNewProfileSeed('fresh');
    showToast(`Created "${name}"`);
  };

  const handleImportCode = () => {
    const code = extractCode(importCode);
    if (!code) {
      showToast('Paste a code first');
      return;
    }
    try {
      const decoded = decodeProfileCode(code);
      createProfile(decoded.name || 'Imported', decoded.colorMap);
      setImportCode('');
      showToast(`Imported "${decoded.name || 'Imported'}"`);
    } catch {
      showToast("Couldn't read that code");
    }
  };

  const handleLoadFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = parseProfileImport(text);
      createProfile(result.profileName, result.colorMap);
      showToast('Loaded from file');
    } catch {
      showToast('Invalid file');
    }
    e.target.value = '';
  };

  const handleRename = (id: string, currentName: string) => {
    const next = window.prompt('Rename profile:', currentName);
    if (next && next.trim()) {
      renameProfile(id, next.trim());
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (profiles.length <= 1) {
      showToast('Need at least one profile');
      return;
    }
    if (!window.confirm(`Delete "${name}" permanently?`)) return;
    deleteProfile(id);
  };

  return (
    <Modal
      onClose={onClose}
      label="§ Profiles"
      title="Whose palette are we wearing today?"
    >
      <p className="lede">
        Synesthesia is personal — every mind sees letters differently. Keep a
        profile for yourself, and load your girlfriend's, your sister's, or a
        friend's, to see the world through their vowels.
      </p>

      <div className="field">
        <label>Saved profiles on this device</label>
        <div className="profile-list">
          {sortedProfiles.map((p) => {
            const isActive = p.id === activeProfileId;
            return (
              <div
                key={p.id}
                className={`profile-row${isActive ? ' active' : ''}`}
                onClick={() => {
                  if (!isActive) loadProfile(p.id);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!isActive) loadProfile(p.id);
                  }
                }}
              >
                <div className="dotcol">
                  {DOT_SAMPLE_CHARS.map((c) => (
                    <span
                      key={c}
                      style={{ background: p.colorMap[c]?.hex ?? '#888' }}
                    />
                  ))}
                </div>
                <div>
                  <div className="name">
                    {p.name}
                    {isActive && (
                      <span className="name-active-tag">Active</span>
                    )}
                  </div>
                  <div className="meta2">
                    {new Date(p.createdAt).toLocaleDateString()} · {p.id.slice(0, 8)}
                  </div>
                </div>
                <button
                  type="button"
                  className="rowbtn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename(p.id, p.name);
                  }}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="rowbtn danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(p.id, p.name);
                  }}
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
        <div className="new-profile-row">
          <input
            type="text"
            placeholder="New profile name (e.g. Maya)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
          <button className="btn solid" type="button" onClick={handleCreate}>
            + Create fresh
          </button>
        </div>
        <div className="palette-init">
          <div className="init-label">Initialize color palette</div>
          <div className="btn-row" style={{ marginTop: 8 }}>
            {PROFILE_SEED_OPTIONS.map((option) => (
              <button
                key={option.id}
                className={`btn${newProfileSeed === option.id ? ' solid' : ''}`}
                type="button"
                onClick={() => setNewProfileSeed(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="field">
        <label>Paste a shared profile code</label>
        <textarea
          placeholder="Paste the #code from a friend's share link, or paste the whole link…"
          value={importCode}
          onChange={(e) => setImportCode(e.target.value)}
        />
        <div className="btn-row" style={{ marginTop: 4 }}>
          <button
            className="btn solid"
            type="button"
            onClick={handleImportCode}
          >
            Import from code
          </button>
          <button className="btn" type="button" onClick={handleLoadFile}>
            Load .json file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>
    </Modal>
  );
}
