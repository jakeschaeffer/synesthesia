import { useMemo } from 'react';
import { useSynesthesiaStore } from '../store/useSynesthesiaStore';

interface MastheadProps {
  onManageProfile: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

  const dateStamp = useMemo(() => {
    const d = new Date();
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

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
        <span>{dateStamp}</span>
      </div>
      <div className="mast-sub">
        <span>Grapheme &rarr; Color Index</span>
        <span>
          <span className="dot"></span>Type, hear the palette
          <span className="dot"></span>
        </span>
        <button
          type="button"
          className="profile-chip"
          onClick={onManageProfile}
        >
          Manage profile →
        </button>
      </div>
    </header>
  );
}
