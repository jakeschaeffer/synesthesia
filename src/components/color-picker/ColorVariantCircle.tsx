interface ColorVariantCircleProps {
  hex: string;
  isBase?: boolean;
  onClick: () => void;
}

export function ColorVariantCircle({ hex, isBase, onClick }: ColorVariantCircleProps) {
  return (
    <button
      onClick={onClick}
      className="w-11 h-11 rounded-full border-2 transition-transform duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/40 active:scale-95"
      style={{
        backgroundColor: hex,
        borderColor: isBase ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
      }}
      title={hex}
    />
  );
}
