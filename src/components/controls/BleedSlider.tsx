import * as Slider from '@radix-ui/react-slider';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';

export function BleedSlider() {
  const bleed = useSynesthesiaStore((s) => s.gradientSettings.bleed);
  const setBleed = useSynesthesiaStore((s) => s.setBleed);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs text-white/50 uppercase tracking-wider">
          Color Bleed
        </label>
        <span className="text-xs text-white/30 tabular-nums">
          {Math.round(bleed * 100)}%
        </span>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none h-5 w-full"
        value={[bleed]}
        onValueChange={([v]) => setBleed(v)}
        min={0}
        max={1}
        step={0.01}
      >
        <Slider.Track className="bg-white/10 relative grow rounded-full h-1.5">
          <Slider.Range className="absolute bg-white/25 rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-md hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors" />
      </Slider.Root>
      <div className="flex justify-between text-[10px] text-white/20">
        <span>Sharp</span>
        <span>Smooth</span>
      </div>
    </div>
  );
}
