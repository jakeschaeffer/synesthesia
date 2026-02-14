import { useCallback, useRef, useEffect } from 'react';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';
import type { ColorMap } from '../../types';

// iPhone vertical: 1170 x 2532 (logical 390x844 @3x)
const CANVAS_W = 1170;
const CANVAS_H = 2532;

function renderColorKey(canvas: HTMLCanvasElement, colorMap: ColorMap, profileName: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  // Background
  ctx.fillStyle = '#0e0e18';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('My Synesthesia Colors', CANVAS_W / 2, 160);

  // Profile name subtitle
  if (profileName) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '36px system-ui, -apple-system, sans-serif';
    ctx.fillText(profileName, CANVAS_W / 2, 220);
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';

  const marginX = 80;
  const startY = 320;

  // Letters section
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '32px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('LETTERS', marginX, startY);

  const cols = 6;
  const letterRows = Math.ceil(letters.length / cols);
  const cellW = (CANVAS_W - marginX * 2) / cols;
  const cellH = 160;
  const circleR = 42;
  const letterStartY = startY + 40;

  for (let i = 0; i < letters.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const cx = marginX + col * cellW + cellW / 2;
    const cy = letterStartY + row * cellH + circleR + 20;

    const key = letters[i].toLowerCase();
    const color = colorMap[key];
    const hex = color?.hex ?? '#808080';

    // Color circle
    ctx.beginPath();
    ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
    ctx.fillStyle = hex;
    ctx.fill();

    // Subtle border
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Letter label below circle
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(letters[i], cx, cy + circleR + 48);
  }

  // Numbers section
  const numbersStartY = letterStartY + letterRows * cellH + 80;
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '32px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('NUMBERS', marginX, numbersStartY);

  const digitCols = 5;
  const digitCellW = (CANVAS_W - marginX * 2) / digitCols;
  const digitStartY = numbersStartY + 40;

  for (let i = 0; i < digits.length; i++) {
    const row = Math.floor(i / digitCols);
    const col = i % digitCols;
    const cx = marginX + col * digitCellW + digitCellW / 2;
    const cy = digitStartY + row * cellH + circleR + 20;

    const color = colorMap[digits[i]];
    const hex = color?.hex ?? '#808080';

    // Color circle
    ctx.beginPath();
    ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
    ctx.fillStyle = hex;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Digit label below circle
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(digits[i], cx, cy + circleR + 48);
  }

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.font = '28px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Synesthesia Visualizer', CANVAS_W / 2, CANVAS_H - 80);
}

export function ShareColors() {
  const colorMap = useSynesthesiaStore((s) => s.colorMap);
  const profiles = useSynesthesiaStore((s) => s.profiles);
  const activeProfileId = useSynesthesiaStore((s) => s.activeProfileId);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const profileName = activeProfile?.name ?? '';

  useEffect(() => {
    if (canvasRef.current) {
      renderColorKey(canvasRef.current, colorMap, profileName);
    }
  }, [colorMap, profileName]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `synesthesia-colors${profileName ? '-' + profileName.toLowerCase().replace(/\s+/g, '-') : ''}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, [profileName]);

  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'synesthesia-colors.png', { type: 'image/png' });
        const shareData = { files: [file], title: 'My Synesthesia Colors' };
        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            return;
          } catch {
            // User cancelled or share failed — fall through to download
          }
        }
      }

      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'synesthesia-colors.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, []);

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <div className="flex items-center gap-2">
        <button
          onClick={handleShare}
          className="px-3 py-1.5 text-xs bg-white/10 text-white/80 hover:bg-white/15 rounded-md transition-colors"
        >
          Share My Colors
        </button>
        <button
          onClick={handleDownload}
          className="px-3 py-1.5 text-xs bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 rounded-md transition-colors"
        >
          Download PNG
        </button>
      </div>

      {/* Preview — scaled down to fit */}
      <div className="relative w-full overflow-hidden rounded-lg border border-white/10 bg-[#0e0e18]" style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}`, maxHeight: '320px' }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ imageRendering: 'auto' }}
        />
      </div>
    </div>
  );
}
