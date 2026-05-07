import { useSynesthesiaStore } from '../store/useSynesthesiaStore';
import { ALPHANUMERIC_CHARS } from '../constants/defaultColorMap';

interface AtlasGridProps {
  onExportProfile: () => void;
}

export function AtlasGrid({ onExportProfile }: AtlasGridProps) {
  const colorMap = useSynesthesiaStore((s) => s.colorMap);
  const editorChar = useSynesthesiaStore((s) => s.editorChar);
  const setEditorChar = useSynesthesiaStore((s) => s.setEditorChar);

  return (
    <section className="atlas">
      <div className="atlas-head">
        <div>
          <div className="section-label">The Atlas</div>
        </div>
        <div className="meta">
          A–Z &nbsp;·&nbsp; 0–9 &nbsp;·&nbsp;{' '}
          <span className="pill">click to edit</span>
        </div>
      </div>
      <div className="atlas-grid">
        {ALPHANUMERIC_CHARS.map((ch) => {
          const color = colorMap[ch];
          const hex = color?.hex ?? '#cccccc';
          const lum = color?.l ?? 50;
          const isActive = editorChar === ch;
          return (
            <button
              key={ch}
              type="button"
              className={`chip${isActive ? ' active' : ''}`}
              data-lum={lum < 55 ? 'dark' : 'light'}
              style={{ background: hex }}
              onClick={() => setEditorChar(ch)}
              aria-label={`Edit color for ${ch.toUpperCase()}`}
            >
              <div className="g">{ch}</div>
              <div className="n">{hex.toUpperCase()}</div>
            </button>
          );
        })}
      </div>
      <div className="atlas-actions">
        <button className="btn solid" type="button" onClick={onExportProfile}>
          ⤓ Export Profile
        </button>
      </div>
    </section>
  );
}
