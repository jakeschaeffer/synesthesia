import { useCallback, useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ALPHANUMERIC_CHARS,
  DIGITS,
  LETTERS,
} from '../../constants/defaultColorMap';
import { hexToSynColor } from '../../utils/colorUtils';
import type { ColorMap } from '../../types';

const UNASSIGNED_COLOR = hexToSynColor('#2a2a3e');

const SCALE = 2;
const CELL_W = 78;
const CELL_H = 64;
const GAP = 8;
const PAD = 20;
const SECTION_PAD = 16;
const SECTION_HEADER_H = 28;

const LETTER_COLS = 6;
const DIGIT_COLS = 5;

function toRows(chars: string, size: number): string[][] {
  const rows: string[][] = [];
  for (let i = 0; i < chars.length; i += size) {
    rows.push(chars.slice(i, i + size).split(''));
  }
  return rows;
}

const LETTER_ROWS = toRows(LETTERS, LETTER_COLS);
const DIGIT_ROWS = toRows(DIGITS, DIGIT_COLS);

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawRoundedRectStroke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  stroke: string,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawCharGrid(
  ctx: CanvasRenderingContext2D,
  rows: string[][],
  colorMap: ColorMap,
  startX: number,
  startY: number,
) {
  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const cellY = startY + rowIdx * (CELL_H + GAP);

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const char = row[colIdx];
      const cellX = startX + colIdx * (CELL_W + GAP);
      const color = colorMap[char];
      const swatch = color ?? UNASSIGNED_COLOR;

      const innerPad = 8;

      drawRoundedRect(
        ctx,
        cellX,
        cellY,
        CELL_W,
        CELL_H,
        10,
        'rgba(255,255,255,0.03)',
      );
      drawRoundedRectStroke(
        ctx,
        cellX,
        cellY,
        CELL_W,
        CELL_H,
        10,
        'rgba(255,255,255,0.1)',
      );

      // Character letter
      ctx.fillStyle = swatch.hex;
      ctx.font = '600 17px system-ui, -apple-system, sans-serif';
      ctx.fillText(char.toUpperCase(), cellX + innerPad, cellY + 21);

      // "set" / "empty" label
      ctx.fillStyle = 'rgba(255,255,255,0.40)';
      ctx.font = '400 9px system-ui, -apple-system, sans-serif';
      const statusText = color ? 'set' : 'empty';
      const statusW = ctx.measureText(statusText).width;
      ctx.fillText(
        statusText,
        cellX + CELL_W - innerPad - statusW,
        cellY + 19,
      );

      // Swatch bar
      const swatchY = cellY + 29;
      const swatchW = CELL_W - innerPad * 2;
      const swatchH = 8;
      drawRoundedRect(
        ctx,
        cellX + innerPad,
        swatchY,
        swatchW,
        swatchH,
        4,
        swatch.hex,
      );

      // Hex code
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '400 9px ui-monospace, SFMono-Regular, monospace';
      ctx.fillText(
        color ? color.hex.toUpperCase() : '--',
        cellX + innerPad,
        cellY + CELL_H - 8,
      );
    }
  }
}

function renderProfileCanvas(
  colorMap: ColorMap,
  profileName: string,
  assignedCount: number,
): HTMLCanvasElement {
  const gridW =
    LETTER_COLS * CELL_W + (LETTER_COLS - 1) * GAP;
  const contentW = gridW + SECTION_PAD * 2;
  const canvasW = contentW + PAD * 2;

  const headerH = 66;
  const letterGridH =
    LETTER_ROWS.length * CELL_H + (LETTER_ROWS.length - 1) * GAP;
  const digitGridH =
    DIGIT_ROWS.length * CELL_H + (DIGIT_ROWS.length - 1) * GAP;

  const lettersSectionH =
    SECTION_PAD + SECTION_HEADER_H + letterGridH + SECTION_PAD;
  const digitsSectionH =
    SECTION_PAD + SECTION_HEADER_H + digitGridH + SECTION_PAD;

  const canvasH =
    PAD +
    headerH +
    12 +
    lettersSectionH +
    12 +
    digitsSectionH +
    PAD;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW * SCALE;
  canvas.height = canvasH * SCALE;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);

  // Background
  ctx.fillStyle = '#0e0e18';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // --- Header card ---
  let y = PAD;
  drawRoundedRect(ctx, PAD, y, contentW, headerH, 14, 'rgba(255,255,255,0.04)');
  drawRoundedRectStroke(
    ctx,
    PAD,
    y,
    contentW,
    headerH,
    14,
    'rgba(255,255,255,0.1)',
  );

  // "PROFILE LEGEND" subtitle
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '600 9px system-ui, -apple-system, sans-serif';
  ctx.fillText('PROFILE LEGEND', PAD + 16, y + 20);

  // Profile name
  ctx.fillStyle = 'rgba(255,255,255,0.90)';
  ctx.font = '600 16px system-ui, -apple-system, sans-serif';
  ctx.fillText(profileName, PAD + 16, y + 40);

  // Assigned count
  ctx.fillStyle = 'rgba(255,255,255,0.50)';
  ctx.font = '400 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(
    `${assignedCount}/${ALPHANUMERIC_CHARS.length} symbols assigned`,
    PAD + 16,
    y + 56,
  );

  y += headerH + 12;

  // --- Letters Section ---
  drawRoundedRect(
    ctx,
    PAD,
    y,
    contentW,
    lettersSectionH,
    14,
    'rgba(255,255,255,0.02)',
  );
  drawRoundedRectStroke(
    ctx,
    PAD,
    y,
    contentW,
    lettersSectionH,
    14,
    'rgba(255,255,255,0.1)',
  );

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '600 9px system-ui, -apple-system, sans-serif';
  ctx.fillText('LETTERS', PAD + SECTION_PAD, y + SECTION_PAD + 12);

  drawCharGrid(
    ctx,
    LETTER_ROWS,
    colorMap,
    PAD + SECTION_PAD,
    y + SECTION_PAD + SECTION_HEADER_H,
  );

  y += lettersSectionH + 12;

  // --- Numbers Section ---
  drawRoundedRect(
    ctx,
    PAD,
    y,
    contentW,
    digitsSectionH,
    14,
    'rgba(255,255,255,0.02)',
  );
  drawRoundedRectStroke(
    ctx,
    PAD,
    y,
    contentW,
    digitsSectionH,
    14,
    'rgba(255,255,255,0.1)',
  );

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '600 9px system-ui, -apple-system, sans-serif';
  ctx.fillText('NUMBERS', PAD + SECTION_PAD, y + SECTION_PAD + 12);

  drawCharGrid(
    ctx,
    DIGIT_ROWS,
    colorMap,
    PAD + SECTION_PAD,
    y + SECTION_PAD + SECTION_HEADER_H,
  );

  return canvas;
}

interface ProfileExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colorMap: ColorMap;
  profileName: string;
  assignedCount: number;
}

export function ProfileExportDialog({
  open,
  onOpenChange,
  colorMap,
  profileName,
  assignedCount,
}: ProfileExportDialogProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const container = canvasContainerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const canvas = renderProfileCanvas(colorMap, profileName, assignedCount);
    canvas.style.width = `${canvas.width / SCALE}px`;
    canvas.style.height = `${canvas.height / SCALE}px`;
    canvas.style.borderRadius = '12px';
    container.appendChild(canvas);
  }, [open, colorMap, profileName, assignedCount]);

  const handleCopy = useCallback(async () => {
    const container = canvasContainerRef.current;
    const canvas = container?.querySelector('canvas');
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
          'image/png',
        );
      });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available in all contexts
    }
  }, []);

  const handleSave = useCallback(() => {
    const container = canvasContainerRef.current;
    const canvas = container?.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${profileName.toLowerCase().replace(/\s+/g, '-')}-synesthesia-profile.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [profileName]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1a2e] border border-white/10 rounded-xl p-5 z-50 shadow-2xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-white/80 text-sm font-medium mb-1">
            Export Synesthete Profile
          </Dialog.Title>
          <Dialog.Description className="text-[11px] text-white/45 mb-4">
            Preview and save your color profile as an image.
          </Dialog.Description>

          <div ref={canvasContainerRef} className="mb-4 flex justify-center" />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs text-white/50 hover:text-white/70 transition-colors rounded-md"
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 text-xs bg-white/10 text-white/80 hover:bg-white/15 transition-colors rounded-md"
            >
              Save as PNG
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
