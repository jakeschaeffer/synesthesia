import { memo, useCallback } from 'react';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';
import { useLongPress } from '../../hooks/useLongPress';
import type { SynColor } from '../../types';

interface ColoredLetterProps {
  char: string;
  color: SynColor | undefined;
}

const SPACE_COLOR: SynColor = { hex: '#2a2a3e', h: 240, s: 20, l: 20 };

export const ColoredLetter = memo(function ColoredLetter({ char, color }: ColoredLetterProps) {
  const openVariantModal = useSynesthesiaStore((s) => s.openVariantModal);
  const effectiveColor = color ?? SPACE_COLOR;
  const isWhitespace = /\s/.test(char);

  const handleLongPress = useCallback(
    (e: React.PointerEvent) => {
      if (isWhitespace) return;
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      openVariantModal(char.toLowerCase(), effectiveColor, {
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    },
    [char, effectiveColor, openVariantModal, isWhitespace],
  );

  const longPressHandlers = useLongPress({
    onLongPress: handleLongPress,
    threshold: 400,
  });

  return (
    <span
      {...longPressHandlers}
      className="inline-block cursor-pointer select-none transition-colors duration-75"
      style={{
        color: effectiveColor.hex,
        minWidth: isWhitespace ? '0.35em' : undefined,
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
}, (prev, next) => prev.char === next.char && prev.color?.hex === next.color?.hex);
