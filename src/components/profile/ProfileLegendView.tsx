import { useCallback, useMemo } from 'react';
import {
  ALPHANUMERIC_CHARS,
  DIGITS,
  LETTERS,
} from '../../constants/defaultColorMap';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';
import { hexToSynColor } from '../../utils/colorUtils';

const UNASSIGNED_COLOR = hexToSynColor('#2a2a3e');

function toRows(characters: string, rowSize: number): string[][] {
  const rows: string[][] = [];
  for (let i = 0; i < characters.length; i += rowSize) {
    rows.push(characters.slice(i, i + rowSize).split(''));
  }
  return rows;
}

const LETTER_ROWS = toRows(LETTERS, 6);
const DIGIT_ROWS = toRows(DIGITS, 5);

export function ProfileLegendView() {
  const profiles = useSynesthesiaStore((s) => s.profiles);
  const activeProfileId = useSynesthesiaStore((s) => s.activeProfileId);
  const colorMap = useSynesthesiaStore((s) => s.colorMap);
  const assignRainbowColorMap = useSynesthesiaStore((s) => s.assignRainbowColorMap);
  const openVariantModal = useSynesthesiaStore((s) => s.openVariantModal);

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) ?? null,
    [profiles, activeProfileId],
  );

  const assignedCount = useMemo(
    () => ALPHANUMERIC_CHARS.filter((char) => Boolean(colorMap[char])).length,
    [colorMap],
  );

  const handleCellClick = useCallback(
    (char: string, e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      openVariantModal(char, colorMap[char] ?? UNASSIGNED_COLOR, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    },
    [colorMap, openVariantModal],
  );

  const renderLegendRows = (rows: string[][]) =>
    rows.map((row, rowIndex) => (
      <div
        key={rowIndex}
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}
      >
        {row.map((char) => {
          const color = colorMap[char];
          const swatch = color ?? UNASSIGNED_COLOR;
          return (
            <button
              key={char}
              type="button"
              onClick={(e) => handleCellClick(char, e)}
              className="group rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2 text-left hover:border-white/25 hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-lg font-semibold"
                  style={{ color: swatch.hex }}
                >
                  {char.toUpperCase()}
                </span>
                <span className="text-[10px] text-white/40">
                  {color ? 'set' : 'empty'}
                </span>
              </div>
              <div className="h-2 rounded-full mb-1 border border-black/10" style={{ background: swatch.hex }} />
              <div className="text-[10px] tracking-wide text-white/45 font-mono uppercase">
                {color ? color.hex : '--'}
              </div>
            </button>
          );
        })}
      </div>
    ));

  return (
    <section className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))] p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                Profile Legend
              </div>
              <h2 className="text-lg font-semibold text-white/90 mt-1">
                {activeProfile?.name ?? 'No profile selected'}
              </h2>
              <p className="text-xs text-white/50 mt-1">
                {assignedCount}/{ALPHANUMERIC_CHARS.length} symbols assigned.
              </p>
            </div>
            <button
              type="button"
              onClick={assignRainbowColorMap}
              className="px-3 py-2 text-xs rounded-xl border border-cyan-200/25 bg-cyan-400/10 text-cyan-100/90 hover:bg-cyan-300/15 hover:border-cyan-200/40 transition-colors"
            >
              Assign Rainbow As Default
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-3">
              Letters
            </h3>
            <div className="space-y-2">{renderLegendRows(LETTER_ROWS)}</div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-3">
              Numbers
            </h3>
            <div className="space-y-2">{renderLegendRows(DIGIT_ROWS)}</div>
          </section>
        </div>
      </div>
    </section>
  );
}
