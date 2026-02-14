import { useState, useCallback } from 'react';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';
import { ProfileSelector } from './ProfileSelector';
import { ProfileCreateDialog } from './ProfileCreateDialog';

interface ProfileManagerProps {
  onProfileCreated?: () => void;
}

export function ProfileManager({ onProfileCreated }: ProfileManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeProfileId = useSynesthesiaStore((s) => s.activeProfileId);
  const profiles = useSynesthesiaStore((s) => s.profiles);
  const deleteProfile = useSynesthesiaStore((s) => s.deleteProfile);
  const updateActiveProfile = useSynesthesiaStore((s) => s.updateActiveProfile);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const handleDelete = useCallback(() => {
    if (activeProfileId) {
      deleteProfile(activeProfileId);
    }
  }, [activeProfileId, deleteProfile]);

  const handleSave = useCallback(() => {
    if (activeProfileId) {
      updateActiveProfile();
    }
  }, [activeProfileId, updateActiveProfile]);

  const handleOpenCreateDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-t border-white/5">
      <span className="text-[10px] text-white/30 uppercase tracking-wider mr-1 shrink-0">
        Profile
      </span>

      <div className="min-w-[150px] flex-1">
        <ProfileSelector onCreateNew={handleOpenCreateDialog} />
      </div>

      {activeProfile && (
        <>
          <button
            onClick={handleSave}
            className="px-2 py-1 text-[10px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 rounded transition-colors"
            title="Save current colors to this profile"
          >
            Update
          </button>
          <button
            onClick={handleDelete}
            className="px-2 py-1 text-[10px] text-red-400/50 hover:text-red-400/80 bg-white/5 hover:bg-red-400/10 rounded transition-colors"
            title="Delete this profile"
          >
            Delete
          </button>
        </>
      )}

      <button
        onClick={handleOpenCreateDialog}
        className="px-2 py-1 text-[10px] text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 rounded transition-colors ml-0 sm:ml-auto"
      >
        + New Profile
      </button>

      <ProfileCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onProfileCreated={onProfileCreated}
      />
    </div>
  );
}
