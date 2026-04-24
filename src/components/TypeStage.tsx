import { useEffect, useRef } from 'react';
import { useSynesthesiaStore } from '../store/useSynesthesiaStore';
import { SpectrogramBar } from './SpectrogramBar';

interface TypeStageProps {
  onShareWord: () => void;
}

const SUGGESTIONS = [
  'Monday',
  'thunder',
  'aubergine',
  '42 cathedrals',
  'saudade',
  'your name',
];

export function TypeStage({ onShareWord }: TypeStageProps) {
  const text = useSynesthesiaStore((s) => s.text);
  const setText = useSynesthesiaStore((s) => s.setText);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (document.querySelector('.modal-backdrop')) return;
      const el = inputRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      if (el.value.length > 0) {
        el.setSelectionRange(0, el.value.length);
      }
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="stage">
      <div className="section-label">
        <span className="num">§ 01</span> The Utterance
      </div>

      <div className="typebox">
        <span className="hint">Type a word, phrase, or name</span>
        <input
          ref={inputRef}
          type="text"
          className="type-input"
          placeholder="thunder, aubergine, tuesday…"
          autoComplete="off"
          spellCheck={false}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="suggest">
          <span className="sep">try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setText(s);
                inputRef.current?.focus();
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <SpectrogramBar onShareWord={onShareWord} />
    </section>
  );
}
