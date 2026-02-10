import * as Slider from '@radix-ui/react-slider';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';

export function MixModeSlider() {
  const wordMix = useSynesthesiaStore((s) => s.gradientSettings.wordMix);
  const setWordMix = useSynesthesiaStore((s) => s.setWordMix);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-xs text-white/50 uppercase tracking-wider">
          Word Influence
        </label>
        <span className="text-xs text-white/30 tabular-nums">
          {Math.round(wordMix * 100)}%
        </span>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none h-5 w-full"
        value={[wordMix]}
        onValueChange={([v]) => setWordMix(v)}
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
        <span>Letter</span>
        <span>Word</span>
      </div>
    </div>
  );
}
