import { useState, useCallback } from 'react';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';
import { ProfileSelector } from './ProfileSelector';
import { ProfileCreateDialog } from './ProfileCreateDialog';
import { Toast } from '../feedback/Toast';

interface ProfileManagerProps {
  onProfileCreated?: () => void;
}

export function ProfileManager({ onProfileCreated }: ProfileManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; undo?: () => void } | null>(null);
  const activeProfileId = useSynesthesiaStore((s) => s.activeProfileId);
  const profiles = useSynesthesiaStore((s) => s.profiles);
  const deleteProfile = useSynesthesiaStore((s) => s.deleteProfile);
  const updateActiveProfile = useSynesthesiaStore((s) => s.updateActiveProfile);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const handleDelete = useCallback(() => {
    if (!activeProfileId) return;
    const deletedProfile = profiles.find((p) => p.id === activeProfileId);
    if (!deletedProfile) return;

    deleteProfile(activeProfileId);
    setToast({
      message: `"${deletedProfile.name}" deleted`,
      undo: () => {
        useSynesthesiaStore.getState().createProfile(
          deletedProfile.name,
          deletedProfile.colorMap,
        );
      },
    });
  }, [activeProfileId, profiles, deleteProfile]);

  const handleSave = useCallback(() => {
    if (activeProfileId) {
      updateActiveProfile();
      setToast({ message: 'Profile saved' });
    }
  }, [activeProfileId, updateActiveProfile]);

  const handleOpenCreateDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-t border-white/5">
      <span className="text-xs text-white/50 uppercase tracking-wider mr-1 shrink-0">
        Profile
      </span>

      <div className="min-w-[150px] flex-1">
        <ProfileSelector onCreateNew={handleOpenCreateDialog} />
      </div>

      {activeProfile && (
        <>
          <button
            onClick={handleSave}
            className="px-3 py-2 text-xs text-white/60 hover:text-white/80 bg-white/5 hover:bg-white/10 rounded transition-colors"
            title="Save current colors to this profile"
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-xs text-red-400/60 hover:text-red-400/90 bg-white/5 hover:bg-red-400/10 rounded transition-colors"
            title="Delete this profile"
          >
            Delete
          </button>
        </>
      )}

      <button
        onClick={handleOpenCreateDialog}
        className="px-3 py-2 text-xs text-white/60 hover:text-white/80 bg-white/5 hover:bg-white/10 rounded transition-colors ml-0 sm:ml-auto"
      >
        + New Profile
      </button>

      <ProfileCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onProfileCreated={onProfileCreated}
      />

      {toast && (
        <Toast
          message={toast.message}
          onUndo={toast.undo}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
