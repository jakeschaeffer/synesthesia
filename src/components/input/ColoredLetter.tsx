import { memo, useCallback } from 'react';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';
import { SPACE_COLOR } from '../../constants/spaceColor';
import type { SynColor } from '../../types';

interface ColoredLetterProps {
  char: string;
  color: SynColor | undefined;
}

export const ColoredLetter = memo(function ColoredLetter({ char, color }: ColoredLetterProps) {
  const openVariantModal = useSynesthesiaStore((s) => s.openVariantModal);
  const effectiveColor = color ?? SPACE_COLOR;
  const isWhitespace = /\s/.test(char);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isWhitespace) return;
      const rect = e.currentTarget.getBoundingClientRect();
      openVariantModal(char.toLowerCase(), effectiveColor, {
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    },
    [char, effectiveColor, openVariantModal, isWhitespace],
  );

  return (
    <span
      onClick={handleClick}
      className={`inline-block select-none transition-all duration-75 ${
        isWhitespace
          ? ''
          : 'cursor-pointer hover:scale-110 hover:drop-shadow-[0_0_6px_currentColor]'
      }`}
      style={{
        color: effectiveColor.hex,
        minWidth: isWhitespace ? '0.35em' : undefined,
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
}, (prev, next) => prev.char === next.char && prev.color?.hex === next.color?.hex);
