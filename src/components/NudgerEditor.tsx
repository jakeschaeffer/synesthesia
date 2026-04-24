import { useEffect, useMemo, useRef } from 'react';
import { useSynesthesiaStore } from '../store/useSynesthesiaStore';
import { hexToSynColor, hslToHex } from '../utils/colorUtils';
import { freshColorMap } from '../utils/palettes';

export function NudgerEditor() {
  const editorChar = useSynesthesiaStore((s) => s.editorChar);
  const setEditorChar = useSynesthesiaStore((s) => s.setEditorChar);
  const colorMap = useSynesthesiaStore((s) => s.colorMap);
  const setColorForChar = useSynesthesiaStore((s) => s.setColorForChar);

  const preEditRef = useRef<string | null>(null);

  useEffect(() => {
    if (editorChar) {
      preEditRef.current = colorMap[editorChar]?.hex ?? null;
    } else {
      preEditRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorChar]);

  const color = editorChar ? colorMap[editorChar] : null;
  const h = Math.round(color?.h ?? 0);
  const s = Math.round(color?.s ?? 0);
  const l = Math.round(color?.l ?? 50);
  const hex = color?.hex ?? '#cccccc';
  const isDark = (color?.l ?? 50) < 55;

  const hueBg = useMemo(
    () =>
      `linear-gradient(90deg, hsl(0 ${s}% ${l}%), hsl(60 ${s}% ${l}%), hsl(120 ${s}% ${l}%), hsl(180 ${s}% ${l}%), hsl(240 ${s}% ${l}%), hsl(300 ${s}% ${l}%), hsl(360 ${s}% ${l}%))`,
    [s, l],
  );
  const satBg = useMemo(
    () => `linear-gradient(90deg, hsl(${h} 0% ${l}%), hsl(${h} 100% ${l}%))`,
    [h, l],
  );
  const litBg = useMemo(
    () =>
      `linear-gradient(90deg, hsl(${h} ${s}% 5%), hsl(${h} ${s}% 50%), hsl(${h} ${s}% 92%))`,
    [h, s],
  );

  const handleHSL = (nextH: number, nextS: number, nextL: number) => {
    if (!editorChar) return;
    const nextHex = hslToHex(nextH, nextS, nextL);
    setColorForChar(editorChar, hexToSynColor(nextHex));
  };

  const rerollThis = () => {
    if (!editorChar) return;
    const fresh = freshColorMap();
    const freshColor = fresh[editorChar];
    if (freshColor) setColorForChar(editorChar, freshColor);
  };

  const resetThis = () => {
    if (!editorChar) return;
    const original = preEditRef.current;
    if (!original) return;
    setColorForChar(editorChar, hexToSynColor(original));
  };

  const done = () => setEditorChar(null);

  if (!editorChar) {
    return (
      <div className="control-block">
        <div className="section-label">The Nudger</div>
        <div className="editor empty">
          <p className="empty-prompt">
            Click any letter in the atlas or the spectrogram bar to nudge its color.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="control-block">
      <div className="section-label">The Nudger</div>
      <div className="editor">
        <div className="corner">Glyph /{editorChar}/</div>
        <div className="editor-body">
          <div className="editor-top">
            <div
              className="preview"
              style={{
                background: hex,
                color: isDark ? '#f6efe0' : '#1a1612',
              }}
            >
              {editorChar}
            </div>
            <div className="readout">
              <div className="pair">
                <div className="k">Glyph</div>
                <div className="v">{editorChar.toUpperCase()}</div>
              </div>
              <div className="pair">
                <div className="k">Hex</div>
                <div className="v hex">{hex.toUpperCase()}</div>
              </div>
              <div className="pair">
                <div className="k">HSL</div>
                <div
                  className="v"
                  style={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontStyle: 'normal',
                  }}
                >
                  H {h}°  S {s}%  L {l}%
                </div>
              </div>
            </div>
          </div>

          <div className="nudge-grid">
            <div className="nudge-row">
              <label htmlFor="nudge-h">Hue</label>
              <input
                id="nudge-h"
                type="range"
                className="rslider"
                min={0}
                max={360}
                value={h}
                step={1}
                style={{ background: hueBg }}
                onChange={(e) => handleHSL(+e.target.value, s, l)}
              />
              <span className="rv">{h}°</span>
            </div>
            <div className="nudge-row">
              <label htmlFor="nudge-s">Saturation</label>
              <input
                id="nudge-s"
                type="range"
                className="rslider"
                min={0}
                max={100}
                value={s}
                step={1}
                style={{ background: satBg }}
                onChange={(e) => handleHSL(h, +e.target.value, l)}
              />
              <span className="rv">{s}%</span>
            </div>
            <div className="nudge-row">
              <label htmlFor="nudge-l">Lightness</label>
              <input
                id="nudge-l"
                type="range"
                className="rslider"
                min={5}
                max={92}
                value={l}
                step={1}
                style={{ background: litBg }}
                onChange={(e) => handleHSL(h, s, +e.target.value)}
              />
              <span className="rv">{l}%</span>
            </div>
          </div>

          <div className="btn-row">
            <button className="btn" type="button" onClick={rerollThis}>
              ↻ Reroll this one
            </button>
            <button className="btn" type="button" onClick={resetThis}>
              Reset
            </button>
            <button className="btn solid" type="button" onClick={done}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
