import { useCallback, useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { ColorMap, GradientSettings, GradientStop } from '../../types';
import { computeGradientStops } from '../../utils/gradientCalculation';

interface ShareWordColorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  colorMap: ColorMap;
  gradientSettings: GradientSettings;
}

const IMAGE_WIDTH = 1080;
const IMAGE_HEIGHT = 1440;
const TOP_HEIGHT = IMAGE_HEIGHT / 2;
const BOTTOM_HEIGHT = IMAGE_HEIGHT / 2;
const HORIZONTAL_PADDING = 96;
const VERTICAL_PADDING = 84;
const FONT_FAMILY = "'SF Mono', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace";

export function ShareWordColorDialog({
  open,
  onOpenChange,
  text,
  colorMap,
  gradientSettings,
}: ShareWordColorDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [feedback, setFeedback] = useState('');

  const drawToCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
    if (!canvas || !open) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = IMAGE_WIDTH;
    canvas.height = IMAGE_HEIGHT;

    const stops = computeGradientStops(text, colorMap, gradientSettings);
    drawGradientHalf(ctx, stops);
    drawTextHalf(ctx, sanitizeDisplayText(text));
  }, [open, text, colorMap, gradientSettings]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const downloadLink = document.createElement('a');
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = buildFileName(text);
    downloadLink.click();
  }, [text]);

  const handleCopy = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
      setFeedback('Copy is not available in this browser.');
      return;
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((generatedBlob) => resolve(generatedBlob), 'image/png');
    });

    if (!blob) {
      setFeedback('Could not generate image data.');
      return;
    }

    try {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      setFeedback('Image copied to clipboard.');
    } catch {
      setFeedback('Copy failed. Try Save PNG instead.');
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setFeedback('');
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1a2e] border border-white/10 rounded-xl p-5 z-50 w-[min(92vw,420px)] shadow-2xl">
          <Dialog.Title className="text-white/85 text-sm font-medium mb-1">
            Share word/color pair
          </Dialog.Title>
          <p className="text-[11px] text-white/40 mb-3">
            3:4 export with gradient top and fitted text bottom.
          </p>

          <div className="rounded-lg border border-white/10 overflow-hidden bg-[#0e0e18] mb-3">
            <canvas
              ref={drawToCanvas}
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              className="block w-full h-auto aspect-[3/4]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-3 py-1.5 text-xs text-white/50 hover:text-white/70 transition-colors rounded-md"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs bg-white/8 text-white/80 hover:bg-white/12 transition-colors rounded-md"
            >
              Copy
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-xs bg-white/10 text-white/90 hover:bg-white/15 transition-colors rounded-md"
            >
              Save PNG
            </button>
          </div>

          <p className="min-h-4 mt-2 text-[11px] text-white/45">{feedback}</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function drawGradientHalf(ctx: CanvasRenderingContext2D, stops: GradientStop[]): void {
  if (stops.length === 0) {
    ctx.fillStyle = '#12121c';
    ctx.fillRect(0, 0, IMAGE_WIDTH, TOP_HEIGHT);
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, IMAGE_WIDTH, 0);
  for (const stop of stops) {
    gradient.addColorStop(clampOffset(stop.offset), stop.color);
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, IMAGE_WIDTH, TOP_HEIGHT);
}

function drawTextHalf(ctx: CanvasRenderingContext2D, rawText: string): void {
  const text = rawText || 'Synesthesia';
  ctx.fillStyle = '#0e0e18';
  ctx.fillRect(0, TOP_HEIGHT, IMAGE_WIDTH, BOTTOM_HEIGHT);

  const y = TOP_HEIGHT + VERTICAL_PADDING;
  const width = IMAGE_WIDTH - HORIZONTAL_PADDING * 2;
  const height = BOTTOM_HEIGHT - VERTICAL_PADDING * 2;

  const layout = fitText(ctx, text, width, height);
  ctx.fillStyle = '#f5f5ff';
  ctx.font = `700 ${layout.fontSize}px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const totalHeight = layout.lines.length * layout.lineHeight;
  let baseline = y + (height - totalHeight) / 2 + layout.lineHeight * 0.8;

  for (const line of layout.lines) {
    ctx.fillText(line, IMAGE_WIDTH / 2, baseline);
    baseline += layout.lineHeight;
  }
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
): { lines: string[]; fontSize: number; lineHeight: number } {
  const maxFontSize = 320;
  const minFontSize = 28;

  for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 2) {
    ctx.font = `700 ${fontSize}px ${FONT_FAMILY}`;
    const lines = wrapIntoLines(ctx, text, maxWidth);
    const lineHeight = Math.ceil(fontSize * 1.08);
    if (lines.length * lineHeight <= maxHeight) {
      return { lines, fontSize, lineHeight };
    }
  }

  ctx.font = `700 ${minFontSize}px ${FONT_FAMILY}`;
  const lineHeight = Math.ceil(minFontSize * 1.08);
  const maxLines = Math.max(1, Math.floor(maxHeight / lineHeight));
  const wrapped = wrapIntoLines(ctx, text, maxWidth);
  const lines = wrapped.slice(0, maxLines);

  if (wrapped.length > maxLines) {
    lines[maxLines - 1] = truncateLine(ctx, lines[maxLines - 1], maxWidth);
  }

  return { lines, fontSize: minFontSize, lineHeight };
}

function wrapIntoLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!word) continue;
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    if (ctx.measureText(word).width <= maxWidth) {
      currentLine = word;
      continue;
    }

    const chunks = splitLongToken(ctx, word, maxWidth);
    lines.push(...chunks.slice(0, -1));
    currentLine = chunks[chunks.length - 1];
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}

function splitLongToken(
  ctx: CanvasRenderingContext2D,
  token: string,
  maxWidth: number,
): string[] {
  const chunks: string[] = [];
  let current = '';

  for (const char of token) {
    const candidate = `${current}${char}`;
    if (!current || ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }
    chunks.push(current);
    current = char;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [token];
}

function truncateLine(
  ctx: CanvasRenderingContext2D,
  line: string,
  maxWidth: number,
): string {
  const ellipsis = '…';
  if (ctx.measureText(line).width <= maxWidth) return line;

  let trimmed = line;
  while (trimmed.length > 0 && ctx.measureText(`${trimmed}${ellipsis}`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }

  return trimmed ? `${trimmed}${ellipsis}` : ellipsis;
}

function sanitizeDisplayText(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function buildFileName(input: string): string {
  const stem = sanitizeDisplayText(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  return stem ? `synesthesia-${stem}.png` : 'synesthesia-word-color.png';
}

function clampOffset(value: number): number {
  return Math.max(0, Math.min(1, value));
}
