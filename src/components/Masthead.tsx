import { useMemo } from 'react';
import { useSynesthesiaStore } from '../store/useSynesthesiaStore';

interface MastheadProps {
  onManageProfile: () => void;
}

export function Masthead({ onManageProfile }: MastheadProps) {
  const activeProfileId = useSynesthesiaStore((s) => s.activeProfileId);
  const profiles = useSynesthesiaStore((s) => s.profiles);

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) ?? null,
    [profiles, activeProfileId],
  );

  const profileLabel = activeProfile
    ? `${activeProfile.name}'s palette`
    : 'Unnamed profile';

  return (
    <header className="masthead">
      <div className="mast-left">
        A Field Guide to
        <br />
        Seeing Letters.
      </div>
      <h1 className="mast-title">
        Synesthesia <em>Visualizer</em>
      </h1>
      <div className="mast-right">
        <span>{profileLabel}</span>
        <br />
        <button
          type="button"
          className="profile-chip"
          onClick={onManageProfile}
        >
          Manage profile →
        </button>
      </div>
      <div className="mast-sub">
        <span>Type letters, see colors</span>
      </div>
    </header>
  );
}
