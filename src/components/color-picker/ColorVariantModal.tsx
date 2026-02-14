import { useCallback, useEffect, useRef } from 'react';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';
import { hexToSynColor, hslToHex } from '../../utils/colorUtils';

const MODAL_WIDTH = 360;
const MODAL_HEIGHT = 360;
const DEFAULT_PREVIEW_COLOR = hexToSynColor('#808080');

function clamp(min: number, max: number, value: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function ColorVariantModal() {
  const { isOpen, character, currentColor, anchorPosition } = useSynesthesiaStore(
    (s) => s.variantModal,
  );
  const closeVariantModal = useSynesthesiaStore((s) => s.closeVariantModal);
  const setColorForChar = useSynesthesiaStore((s) => s.setColorForChar);
  const updateActiveProfile = useSynesthesiaStore((s) => s.updateActiveProfile);
  const modalRef = useRef<HTMLDivElement>(null);

  const closeWithSave = useCallback(() => {
    updateActiveProfile();
    closeVariantModal();
  }, [updateActiveProfile, closeVariantModal]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeWithSave();
      }
    }

    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeWithSave();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, closeWithSave]);

  const resolvedColor =
    currentColor?.hex ? hexToSynColor(currentColor.hex) : DEFAULT_PREVIEW_COLOR;
  const hue = Math.round(clamp(0, 360, currentColor?.h ?? resolvedColor.h));
  const saturation = Math.round(clamp(0, 100, currentColor?.s ?? resolvedColor.s));
  const lightness = Math.round(clamp(0, 100, currentColor?.l ?? resolvedColor.l));
  const previewHex = currentColor?.hex ?? resolvedColor.hex;

  const applyColor = useCallback(
    (nextHue: number, nextSaturation: number, nextLightness: number) => {
      if (!character || !isOpen) return;
      const nextHex = hslToHex(nextHue, nextSaturation, nextLightness);
      setColorForChar(character, {
        hex: nextHex,
        h: nextHue,
        s: nextSaturation,
        l: nextLightness,
      });
    },
    [character, isOpen, setColorForChar],
  );

  const handleHueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      applyColor(Number(e.target.value), saturation, lightness);
    },
    [saturation, lightness, applyColor],
  );

  const handleSaturationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      applyColor(hue, Number(e.target.value), lightness);
    },
    [hue, lightness, applyColor],
  );

  const handleLightnessChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      applyColor(hue, saturation, Number(e.target.value));
    },
    [hue, saturation, applyColor],
  );

  if (!isOpen || !character || !currentColor || !anchorPosition) return null;

  const left = clamp(
    8,
    window.innerWidth - MODAL_WIDTH - 8,
    anchorPosition.x - MODAL_WIDTH / 2,
  );
  const top = clamp(
    8,
    window.innerHeight - MODAL_HEIGHT - 8,
    anchorPosition.y + 10,
  );

  return (
    <div
      ref={modalRef}
      className="fixed z-50 w-[360px] bg-[#101620]/95 border border-white/10 rounded-2xl shadow-2xl p-4 backdrop-blur-lg"
      style={{ left, top }}
    >
      <div
        className="rounded-xl p-3 mb-4 h-32 flex flex-col justify-between border border-white/15"
        style={{ background: previewHex }}
      >
        <div className="flex items-start justify-between">
          <span className="text-[11px] uppercase tracking-[0.18em] text-black/45">
            Selected
          </span>
          <span className="text-xl font-semibold text-black/70">
            {character.toUpperCase()}
          </span>
        </div>
        <div className="text-black/75">
          <div className="text-sm font-medium">{previewHex.toUpperCase()}</div>
          <div className="text-xs">
            H{Math.round(hue)} S{Math.round(saturation)} L{Math.round(lightness)}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.14em] text-white/60">
            Hue
          </span>
          <input
            type="range"
            min={0}
            max={360}
            value={hue}
            onChange={handleHueChange}
            onPointerUp={updateActiveProfile}
            onKeyUp={updateActiveProfile}
            className="w-full mt-1"
            style={{
              accentColor: '#f3f3f3',
              background:
                'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
            }}
          />
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.14em] text-white/60">
            Saturation
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={saturation}
            onChange={handleSaturationChange}
            onPointerUp={updateActiveProfile}
            onKeyUp={updateActiveProfile}
            className="w-full mt-1"
            style={{
              accentColor: '#f3f3f3',
              background: `linear-gradient(to right, hsl(${hue} 0% ${lightness}%), hsl(${hue} 100% ${lightness}%))`,
            }}
          />
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.14em] text-white/60">
            Lightness
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={lightness}
            onChange={handleLightnessChange}
            onPointerUp={updateActiveProfile}
            onKeyUp={updateActiveProfile}
            className="w-full mt-1"
            style={{
              accentColor: '#f3f3f3',
              background: `linear-gradient(to right, #000000, hsl(${hue} ${saturation}% 50%), #ffffff)`,
            }}
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={closeWithSave}
          className="px-3 py-1.5 text-xs rounded-lg border border-white/15 text-white/75 hover:text-white hover:border-white/30 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
