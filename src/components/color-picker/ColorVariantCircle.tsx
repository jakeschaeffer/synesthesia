interface ColorVariantCircleProps {
  hex: string;
  isBase?: boolean;
  isFocused?: boolean;
  onClick: () => void;
}

export function ColorVariantCircle({ hex, isBase, isFocused, onClick }: ColorVariantCircleProps) {
  return (
    <button
      onClick={onClick}
      role="option"
      aria-selected={isFocused}
      className={`w-11 h-11 rounded-full border-2 transition-transform duration-150 hover:scale-110 focus:outline-none active:scale-95 ${
        isFocused ? 'scale-110 ring-2 ring-white/60' : ''
      }`}
      style={{
        backgroundColor: hex,
        borderColor: isBase ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
      }}
      title={hex}
    />
  );
}
