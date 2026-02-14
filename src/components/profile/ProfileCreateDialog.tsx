import { useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';

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
  const createProfile = useSynesthesiaStore((s) => s.createProfile);

  const handleCreate = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createProfile(trimmed);
    onProfileCreated?.();
    setName('');
    onOpenChange(false);
  }, [name, createProfile, onOpenChange, onProfileCreated]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleCreate();
    },
    [handleCreate],
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1a2e] border border-white/10 rounded-xl p-5 z-50 w-80 shadow-2xl">
          <Dialog.Title className="text-white/80 text-sm font-medium mb-3">
            Create Empty Profile
          </Dialog.Title>
          <p className="text-[11px] text-white/45 mb-3">
            New profiles start with no assigned colors.
          </p>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Profile name..."
            className="w-full bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/25 placeholder:text-white/20 mb-4"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-3 py-1.5 text-xs text-white/50 hover:text-white/70 transition-colors rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="px-3 py-1.5 text-xs bg-white/10 text-white/80 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md"
            >
              Create
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
