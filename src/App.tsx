import { useCallback, useEffect, useRef, useState } from 'react';
import { Masthead } from './components/Masthead';
import { TypeStage } from './components/TypeStage';
import { ControlsPanel } from './components/ControlsPanel';
import { AtlasGrid } from './components/AtlasGrid';
import { Toast } from './components/Toast';
import { ProfileManagerModal } from './components/ProfileManagerModal';
import { ShareWordModal } from './components/ShareWordModal';
import { ExportProfileModal } from './components/ExportProfileModal';
import { useSynesthesiaStore } from './store/useSynesthesiaStore';
import { showToast } from './hooks/useToast';
import {
  decodeProfileCode,
  decodeWordCode,
} from './utils/shareCodes';

export default function App() {
  const ensureEmmaProfile = useSynesthesiaStore((s) => s.ensureEmmaProfile);
  const createProfile = useSynesthesiaStore((s) => s.createProfile);
  const setText = useSynesthesiaStore((s) => s.setText);
  const colorMap = useSynesthesiaStore((s) => s.colorMap);
  const text = useSynesthesiaStore((s) => s.text);

  const [profileOpen, setProfileOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState('Saved locally');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    ensureEmmaProfile();
  }, [ensureEmmaProfile]);

  // flash save indicator when colorMap changes
  const firstRenderRef = useRef(true);
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    setSaveIndicator('Saving…');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setSaveIndicator('Saved locally'), 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [colorMap]);

  // hash auto-import on first load
  const hashImportRanRef = useRef(false);
  useEffect(() => {
    if (hashImportRanRef.current) return;
    hashImportRanRef.current = true;
    const raw = window.location.hash ? window.location.hash.slice(1) : '';
    if (!raw) return;
    try {
      if (raw.startsWith('p1~')) {
        const decoded = decodeProfileCode(raw);
        const ok = window.confirm(
          `Import profile "${decoded.name}"?\n\nThis will be added to your saved profiles and made active.`,
        );
        if (ok) {
          createProfile(decoded.name || 'Shared', decoded.colorMap);
          showToast(`Imported "${decoded.name || 'Shared'}"`);
        }
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search,
        );
      } else if (raw.startsWith('w1~')) {
        const decoded = decodeWordCode(raw);
        const ok = window.confirm(
          `Open shared word "${decoded.word}"?\n\nIts colors will be loaded into a new profile so your active one isn't overwritten.`,
        );
        if (ok) {
          const merged = { ...colorMap };
          Object.entries(decoded.colorMap).forEach(([ch, c]) => {
            merged[ch] = c;
          });
          createProfile(`Shared: "${decoded.word}"`, merged);
          setText(decoded.word);
          showToast('Opened shared word');
        }
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search,
        );
      }
    } catch (e) {
      console.warn('Hash import failed', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openProfileManager = useCallback(() => setProfileOpen(true), []);
  const openShareWord = useCallback(() => setShareOpen(true), []);
  const openExportProfile = useCallback(() => setExportOpen(true), []);

  return (
    <>
      <div className="page">
        <Masthead onManageProfile={openProfileManager} />
        <TypeStage onShareWord={openShareWord} />
        <ControlsPanel />
        <AtlasGrid onExportProfile={openExportProfile} />
        <footer className="foot">
          <span className="vein" />
          <span>{saveIndicator}</span>
          <span className="vein" />
          <span>Synesthesia Visualizer</span>
        </footer>
      </div>

      {profileOpen && (
        <ProfileManagerModal onClose={() => setProfileOpen(false)} />
      )}
      {shareOpen && (
        <ShareWordModal
          onClose={() => setShareOpen(false)}
          initialWord={text}
        />
      )}
      {exportOpen && (
        <ExportProfileModal onClose={() => setExportOpen(false)} />
      )}
      <Toast />
    </>
  );
}
