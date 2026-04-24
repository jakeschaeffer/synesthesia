import { useMemo, useState } from 'react';
import { Modal } from './Modal';
import { useSynesthesiaStore } from '../store/useSynesthesiaStore';
import {
  buildShareUrl,
  encodeProfileCode,
} from '../utils/shareCodes';
import { serializeProfileExport } from '../utils/profileTransfer';
import { copyToClipboard } from '../utils/copy';
import { showToast } from '../hooks/useToast';

interface ExportProfileModalProps {
  onClose: () => void;
}

export function ExportProfileModal({ onClose }: ExportProfileModalProps) {
  const activeProfileId = useSynesthesiaStore((s) => s.activeProfileId);
  const profiles = useSynesthesiaStore((s) => s.profiles);
  const colorMap = useSynesthesiaStore((s) => s.colorMap);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const [name, setName] = useState(activeProfile?.name ?? 'Shared');

  const shareLink = useMemo(() => {
    const clean = name.trim() || activeProfile?.name || 'Shared';
    return buildShareUrl(encodeProfileCode(clean, colorMap));
  }, [name, colorMap, activeProfile?.name]);

  const copyLink = () => copyToClipboard(shareLink, 'Link copied');

  const downloadJson = () => {
    const clean = name.trim() || activeProfile?.name || 'Shared';
    const json = serializeProfileExport(clean, colorMap);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clean.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.synesthesia.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Downloaded');
  };

  return (
    <Modal
      onClose={onClose}
      label="§ Export full profile"
      title="Send your entire alphabet."
    >
      <p className="lede">
        Your complete A–Z and 0–9, encoded into a shareable link. Anyone who
        opens it can import it into their own atlas and see the world exactly
        as you do.
      </p>

      <div className="field">
        <label>Profile name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Shareable link</label>
        <div className="link-textarea">{shareLink}</div>
        <div className="btn-row">
          <button className="btn solid" type="button" onClick={copyLink}>
            ⎘ Copy link
          </button>
          <button className="btn" type="button" onClick={downloadJson}>
            ⤓ Download .json
          </button>
        </div>
      </div>
    </Modal>
  );
}
