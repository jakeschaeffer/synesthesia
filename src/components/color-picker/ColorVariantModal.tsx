import { useEffect, useRef } from 'react';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';
import { useColorVariants } from '../../hooks/useColorVariants';
import { hexToSynColor } from '../../utils/colorUtils';
import { ColorVariantCircle } from './ColorVariantCircle';

export function ColorVariantModal() {
  const { isOpen, character, currentColor, anchorPosition } = useSynesthesiaStore(
    (s) => s.variantModal,
  );
  const closeVariantModal = useSynesthesiaStore((s) => s.closeVariantModal);
  const setColorForChar = useSynesthesiaStore((s) => s.setColorForChar);
  const updateActiveProfile = useSynesthesiaStore((s) => s.updateActiveProfile);

  const variants = useColorVariants(currentColor?.hex ?? null, 6);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeVariantModal();
      }
    }

    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') closeVariantModal();
    }

    // Delay adding listeners so the long-press pointerup doesn't immediately close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, closeVariantModal]);

  if (!isOpen || !character || !currentColor || !anchorPosition) return null;

  const handleSelect = (hex: string) => {
    setColorForChar(character, hexToSynColor(hex));
    updateActiveProfile();
    closeVariantModal();
  };

  // Position the modal above the letter, centered
  const modalWidth = 280;
  const left = Math.max(8, Math.min(anchorPosition.x - modalWidth / 2, window.innerWidth - modalWidth - 8));
  const top = Math.max(8, anchorPosition.y - 80);

  return (
    <div
      ref={modalRef}
      className="fixed z-50 bg-[#1a1a2e]/95 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl"
      style={{ left, top }}
    >
      <div className="text-center mb-2">
        <span
          className="text-2xl font-bold"
          style={{ color: currentColor.hex }}
        >
          {character.toUpperCase()}
        </span>
      </div>
      <div className="flex gap-2 justify-center flex-wrap">
        <ColorVariantCircle
          hex={currentColor.hex}
          isBase
          onClick={() => closeVariantModal()}
        />
        {variants.map((hex, i) => (
          <ColorVariantCircle
            key={i}
            hex={hex}
            onClick={() => handleSelect(hex)}
          />
        ))}
      </div>
    </div>
  );
}
