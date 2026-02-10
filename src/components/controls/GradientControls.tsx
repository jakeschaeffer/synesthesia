import { BleedSlider } from './BleedSlider';
import { MixModeSlider } from './MixModeSlider';

export function GradientControls() {
  return (
    <div className="flex gap-6 px-4 py-3">
      <div className="flex-1">
        <BleedSlider />
      </div>
      <div className="flex-1">
        <MixModeSlider />
      </div>
    </div>
  );
}
