import { useCallback } from 'react';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';

export function ProfileSelector() {
  const profiles = useSynesthesiaStore((s) => s.profiles);
  const activeProfileId = useSynesthesiaStore((s) => s.activeProfileId);
  const loadProfile = useSynesthesiaStore((s) => s.loadProfile);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (e.target.value) {
        loadProfile(e.target.value);
      }
    },
    [loadProfile],
  );

  if (profiles.length === 0) return null;

  return (
    <select
      value={activeProfileId ?? ''}
      onChange={handleChange}
      className="bg-white/5 text-white/80 text-xs border border-white/10 rounded-md px-2 py-1.5 outline-none focus:border-white/25 transition-colors cursor-pointer"
    >
      <option value="" className="bg-[#1a1a2e]">
        Select profile...
      </option>
      {profiles.map((p) => (
        <option key={p.id} value={p.id} className="bg-[#1a1a2e]">
          {p.name}
        </option>
      ))}
    </select>
  );
}
