import { useCallback, useMemo } from 'react';
import { useSynesthesiaStore } from '../store/useSynesthesiaStore';
import {
  computeGradientStops,
  stopsToLinearGradient,
} from '../utils/gradientCalculation';

interface SpectrogramBarProps {
  onShareWord: () => void;
}

export function SpectrogramBar({ onShareWord }: SpectrogramBarProps) {
  const text = useSynesthesiaStore((s) => s.text);
  const colorMap = useSynesthesiaStore((s) => s.colorMap);
  const settings = useSynesthesiaStore((s) => s.gradientSettings);
  const setEditorChar = useSynesthesiaStore((s) => s.setEditorChar);

  const filtered = useMemo(
    () => [...text].filter((ch) => /[a-zA-Z0-9 ]/.test(ch)).join(''),
    [text],
  );

  const gradient = useMemo(
    () => stopsToLinearGradient(computeGradientStops(filtered, colorMap, settings)),
    [filtered, colorMap, settings],
  );

  const displayChars = useMemo(() => [...filtered], [filtered]);
  const showTicks = displayChars.length > 0 && displayChars.length <= 28;
  const blendPct = Math.round(settings.bleed * 100);
  const wordEcho = text.trim() ? `"${text}"` : '—';
  const canShare = text.trim().length > 0;

  const selectCharAtIndex = useCallback(
    (index: number) => {
      const char = displayChars[index];
      if (!char || !/[a-z0-9]/i.test(char)) return;
      setEditorChar(char.toLowerCase());
    },
    [displayChars, setEditorChar],
  );

  const handleBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (displayChars.length === 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = (e.clientX - rect.left) / rect.width;
      const index = Math.min(
        displayChars.length - 1,
        Math.max(0, Math.floor(ratio * displayChars.length)),
      );
      selectCharAtIndex(index);
    },
    [displayChars.length, selectCharAtIndex],
  );

  return (
    <div>
      <div className="bar-caption">
        <span>Fig. A &nbsp;·&nbsp; Chromatic Spectrogram</span>
        <span className="word-echo">{wordEcho}</span>
        <span>Blend {blendPct}%</span>
      </div>
      <div className="bar" onClick={handleBarClick} role="group" aria-label="Chromatic spectrogram">
        <div className="gfill" style={{ background: gradient }} />
        {showTicks && (
          <div className="tick-row">
            {displayChars.map((ch, i) => (
              <button
                className={`tick-cell${/[a-z0-9]/i.test(ch) ? ' selectable' : ''}`}
                type="button"
                key={`${ch}-${i}`}
                onClick={(e) => {
                  e.stopPropagation();
                  selectCharAtIndex(i);
                }}
                disabled={!/[a-z0-9]/i.test(ch)}
                aria-label={/[a-z0-9]/i.test(ch) ? `Select ${ch.toUpperCase()} for nudging` : 'Space'}
              >
                {ch === ' ' ? '·' : ch.toLowerCase()}
              </button>
            ))}
          </div>
        )}
        <div className="grain" />
      </div>
      <div className="bar-actions">
        <button
          className="btn solid"
          type="button"
          onClick={onShareWord}
          disabled={!canShare}
        >
          ☍ Share This Word
        </button>
      </div>
    </div>
  );
}
