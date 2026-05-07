import { useMemo, useState } from 'react';
import { Modal } from './Modal';
import { useSynesthesiaStore } from '../store/useSynesthesiaStore';
import {
  computeGradientStops,
  stopsToLinearGradient,
} from '../utils/gradientCalculation';
import {
  buildShareUrl,
  encodeWordCode,
} from '../utils/shareCodes';
import { copyToClipboard } from '../utils/copy';
import { showToast } from '../hooks/useToast';
import type { ColorMap, GradientSettings } from '../types';

interface ShareWordModalProps {
  onClose: () => void;
  initialWord: string;
}

function buildSharePreviewPng(
  word: string,
  filtered: string,
  colorMap: ColorMap,
  settings: GradientSettings,
): string | null {
  if (!word.trim() || filtered.length === 0) return null;

  const segH = 132;
  const segW = 52;
  const scale = window.devicePixelRatio > 1 ? 2 : 1;
  const chars = [...word];
  const totalW = Math.max(1, chars.length) * segW + 40;
  const padX = 20;
  const textY = 62;
  const barY = 88;
  const barH = 28;

  const canvas = document.createElement('canvas');
  canvas.width = totalW * scale;
  canvas.height = segH * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(scale, scale);
  ctx.fillStyle = '#ece2ce';
  ctx.fillRect(0, 0, totalW, segH);

  chars.forEach((ch, i) => {
    const lo = ch.toLowerCase();
    const swatch = colorMap[lo];
    const isDark = (swatch?.l ?? 50) < 55;

    ctx.fillStyle = isDark ? '#f6efe0' : '#1a1612';
    ctx.font = "italic 42px 'Instrument Serif', 'Fraunces', Georgia, serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const displayChar = ch === ' ' ? '\u00A0' : ch;
    ctx.fillText(displayChar, padX + i * segW + segW / 2, textY);
  });

  const barGradientSpec = stopsToLinearGradient(
    computeGradientStops(filtered, colorMap, settings),
  );
  const colorTokens = barGradientSpec.match(/#[0-9a-fA-F]{6}/g) ?? [];
  const barGrad = ctx.createLinearGradient(padX, 0, totalW - padX, 0);
  const stopCount = Math.max(1, colorTokens.length - 1);
  colorTokens.forEach((hex, i) => {
    barGrad.addColorStop(i / stopCount, hex);
  });
  ctx.fillStyle = colorTokens.length > 0 ? barGrad : '#ece2ce';
  ctx.fillRect(padX, barY, totalW - padX * 2, barH);

  ctx.strokeStyle = '#1a1612';
  ctx.lineWidth = 1;
  ctx.strokeRect(padX + 0.5, barY + 0.5, totalW - padX * 2 - 1, barH - 1);

  return canvas.toDataURL('image/png');
}

export function ShareWordModal({ onClose, initialWord }: ShareWordModalProps) {
  const colorMap = useSynesthesiaStore((s) => s.colorMap);
  const settings = useSynesthesiaStore((s) => s.gradientSettings);
  const [word, setWord] = useState(initialWord || 'hello');

  const filtered = useMemo(
    () => [...word].filter((ch) => /[a-zA-Z0-9 ]/.test(ch)).join(''),
    [word],
  );

  const gradient = useMemo(
    () => stopsToLinearGradient(computeGradientStops(filtered, colorMap, settings)),
    [filtered, colorMap, settings],
  );

  const pngDataUrl = useMemo(
    () => buildSharePreviewPng(word, filtered, colorMap, settings),
    [word, filtered, colorMap, settings],
  );

  const shareLink = useMemo(() => {
    if (!word.trim()) return '—';
    return buildShareUrl(encodeWordCode(word, colorMap));
  }, [word, colorMap]);

  const copyLink = () => {
    if (shareLink === '—') return;
    copyToClipboard(shareLink, 'Link copied to clipboard');
  };

  const exportPng = () => {
    if (!pngDataUrl || !word.trim()) return;

    const clean =
      word
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'synesthesia-word';

    const link = document.createElement('a');
    link.href = pngDataUrl;
    link.download = `${clean}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('PNG downloaded');
  };

  return (
    <Modal
      onClose={onClose}
      label="§ Share one word or phrase"
      title="Send someone how you see it."
    >
      <div className="field">
        <label>Word/phrase to share</label>
        <input
          type="text"
          placeholder="e.g. sunday"
          value={word}
          onChange={(e) => setWord(e.target.value)}
        />
      </div>

      <div className="share-preview">
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '.2em',
            color: 'var(--muted)',
            textTransform: 'uppercase',
          }}
        >
          Preview
        </div>
        <div className="word-big">
          {word.trim() ? (
            [...word].map((ch, i) => {
              const lo = ch.toLowerCase();
              const c = colorMap[lo]?.hex;
              const displayChar = ch === ' ' ? '\u00A0' : ch;
              return (
                <span
                  key={i}
                  className="ltr"
                  style={c ? { color: c } : undefined}
                >
                  {displayChar}
                </span>
              );
            })
          ) : (
            '—'
          )}
        </div>
        <div className="bar-mini">
          <div
            className="gf"
            style={{
              background: word.trim() ? gradient : 'transparent',
            }}
          />
        </div>
      </div>

      <div className="field">
        <label>Shareable link (contains only this word's colors)</label>
        <div className="link-textarea">{shareLink}</div>
        <div className="btn-row">
          <button
            className="btn solid"
            type="button"
            onClick={copyLink}
            disabled={shareLink === '—'}
          >
            ⎘ Copy link
          </button>
          <button
            className="btn"
            type="button"
            onClick={exportPng}
            disabled={!word.trim() || !pngDataUrl}
          >
            ⤓ Export image (PNG)
          </button>
        </div>
      </div>

    </Modal>
  );
}
