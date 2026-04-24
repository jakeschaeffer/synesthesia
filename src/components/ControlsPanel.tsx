import { useSynesthesiaStore } from '../store/useSynesthesiaStore';
import { NudgerEditor } from './NudgerEditor';

export function ControlsPanel() {
  const settings = useSynesthesiaStore((s) => s.gradientSettings);
  const setBleed = useSynesthesiaStore((s) => s.setBleed);

  const blendPct = Math.round(settings.bleed * 100);

  return (
    <section className="controls">
      <div className="control-block">
        <div className="section-label">
          <span className="num">02</span> Blend Apparatus
        </div>
        <h3>How much do the letters bleed into one another?</h3>
        <div className="slider-row">
          <span className="end">Hard</span>
          <input
            className="ink"
            type="range"
            min={0}
            max={100}
            value={blendPct}
            onChange={(e) => setBleed(+e.target.value / 100)}
            aria-label="Blend percentage"
          />
          <span className="end">Bled</span>
          <span className="val">{blendPct}%</span>
        </div>
      </div>

      <NudgerEditor />
    </section>
  );
}
