import { useState, useCallback, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';
import { buildRainbowColorMap } from '../../constants/defaultColorMap';
import { parseProfileImport } from '../../utils/profileTransfer';

interface ProfileCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileCreated?: () => void;
}

export function ProfileCreateDialog({
  open,
  onOpenChange,
  onProfileCreated,
}: ProfileCreateDialogProps) {
  const [name, setName] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const createProfile = useSynesthesiaStore((s) => s.createProfile);

  const handleCreate = useCallback((useRainbow: boolean) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setImportError('');
    createProfile(trimmed, useRainbow ? buildRainbowColorMap() : undefined);
    onProfileCreated?.();
    setName('');
    onOpenChange(false);
  }, [name, createProfile, onOpenChange, onProfileCreated]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const [file] = Array.from(event.target.files ?? []);
      event.target.value = '';
      if (!file) return;

      try {
        const raw = await file.text();
        const imported = parseProfileImport(raw);
        const nextName = name.trim() || imported.profileName || 'Imported Profile';
        createProfile(nextName, imported.colorMap);
        setImportError('');
        onProfileCreated?.();
        setName('');
        onOpenChange(false);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Could not import profile JSON.';
        setImportError(message);
      }
    },
    [name, createProfile, onOpenChange, onProfileCreated],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleCreate(false);
    },
    [handleCreate],
  );

  useEffect(() => {
    if (!open) {
      setImportError('');
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1a2e] border border-white/10 rounded-xl p-5 z-50 w-80 shadow-2xl">
          <Dialog.Title className="text-white/80 text-sm font-medium mb-3">
            Add Profile
          </Dialog.Title>
          <p className="text-[11px] text-white/45 mb-3">
            Create a blank profile, assign rainbow, or import a JSON legend.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportChange}
            className="hidden"
          />
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Profile name..."
            className="w-full bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/25 placeholder:text-white/20 mb-4"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-3 py-1.5 text-xs text-white/50 hover:text-white/70 transition-colors rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={() => handleCreate(true)}
              disabled={!name.trim()}
              className="px-3 py-1.5 text-xs bg-white/8 text-white/70 hover:bg-white/12 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md"
            >
              Assign rainbow as default
            </button>
            <button
              onClick={handleImportClick}
              className="px-3 py-1.5 text-xs bg-white/8 text-white/70 hover:bg-white/12 transition-colors rounded-md"
            >
              Import synesthete profile
            </button>
            <button
              onClick={() => handleCreate(false)}
              disabled={!name.trim()}
              className="px-3 py-1.5 text-xs bg-white/10 text-white/80 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md"
            >
              Create
            </button>
          </div>
          <p className="mt-2 min-h-4 text-[11px] text-red-300/80">{importError}</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
