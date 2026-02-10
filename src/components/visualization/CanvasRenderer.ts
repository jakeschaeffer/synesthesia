import type { GradientStop } from '../../types';

export function renderGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stops: GradientStop[],
): void {
  ctx.clearRect(0, 0, width, height);

  if (stops.length === 0) {
    // Empty state: dark background
    ctx.fillStyle = '#12121c';
    ctx.fillRect(0, 0, width, height);

    // Subtle hint text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.font = `${Math.min(width * 0.04, 24)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Start typing to see colors...', width / 2, height / 2);
    return;
  }

  // Main horizontal gradient
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  for (const stop of stops) {
    gradient.addColorStop(Math.max(0, Math.min(1, stop.offset)), stop.color);
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Subtle vertical depth overlay
  const vertGradient = ctx.createLinearGradient(0, 0, 0, height);
  vertGradient.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
  vertGradient.addColorStop(0.4, 'rgba(0, 0, 0, 0)');
  vertGradient.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
  ctx.fillStyle = vertGradient;
  ctx.fillRect(0, 0, width, height);
}
