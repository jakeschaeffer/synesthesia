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

interface ShareWordModalProps {
  onClose: () => void;
  initialWord: string;
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

  const shareLink = useMemo(() => {
    if (!word.trim()) return '—';
    return buildShareUrl(encodeWordCode(word, colorMap));
  }, [word, colorMap]);

  const copyLink = () => {
    if (shareLink === '—') return;
    copyToClipboard(shareLink, 'Link copied to clipboard');
  };

  const exportPng = () => {
    if (!word.trim()) return;
    const segH = 96;
    const segW = 52;
    const scale = window.devicePixelRatio > 1 ? 2 : 1;
    const chars = [...word];
    const totalW = Math.max(1, chars.length) * segW;

    const canvas = document.createElement('canvas');
    canvas.width = totalW * scale;
    canvas.height = segH * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      showToast('Could not create PNG');
      return;
    }

    ctx.scale(scale, scale);

    chars.forEach((ch, i) => {
      const lo = ch.toLowerCase();
      const swatch = colorMap[lo];
      const hex = swatch?.hex ?? '#ece2ce';
      const isDark = (swatch?.l ?? 50) < 55;

      ctx.fillStyle = hex;
      ctx.fillRect(i * segW, 0, segW, segH);

      ctx.fillStyle = isDark ? '#f6efe0' : '#1a1612';
      ctx.font = "italic 42px 'Instrument Serif', 'Fraunces', Georgia, serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ch, i * segW + segW / 2, segH / 2 + 5);
    });

    ctx.strokeStyle = '#1a1612';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, totalW - 1, segH - 1);

    const clean =
      word
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'synesthesia-word';
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${clean}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('PNG downloaded');
  };

  return (
    <Modal
      onClose={onClose}
      label="§ Share one word"
      title="Send someone how you see it."
    >
      <div className="field">
        <label>Word to share</label>
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
              return (
                <span
                  key={i}
                  className="ltr"
                  style={c ? { color: c } : undefined}
                >
                  {ch}
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
            disabled={!word.trim()}
          >
            ⤓ Export image (PNG)
          </button>
        </div>
      </div>

    </Modal>
  );
}
