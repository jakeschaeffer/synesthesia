import { useCallback, useRef } from 'react';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';
import { ColoredLetter } from './ColoredLetter';

export function TextInputArea() {
  const text = useSynesthesiaStore((s) => s.text);
  const setText = useSynesthesiaStore((s) => s.setText);
  const colorMap = useSynesthesiaStore((s) => s.colorMap);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sharedTextLayoutClasses =
    'absolute inset-0 w-full h-full px-8 py-6 font-mono text-3xl leading-9 text-center whitespace-pre-wrap break-words';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
    },
    [setText],
  );

  return (
    <div className="relative flex-1 min-h-[120px] flex items-center justify-center">
      {/* Invisible textarea for actual input */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        className={`syn-input ${sharedTextLayoutClasses} resize-none bg-transparent text-transparent caret-white/50 outline-none z-10`}
        placeholder=""
        spellCheck={false}
        autoComplete="off"
      />

      {/* Colored letter overlay */}
      <div
        className={`${sharedTextLayoutClasses} pointer-events-none z-20`}
        aria-hidden="true"
      >
        {text.length === 0 && (
          <span className="text-white/20">Type something...</span>
        )}
        {text.split('').map((char, i) => (
          <span key={i} className="pointer-events-auto">
            <ColoredLetter
              char={char}
              color={colorMap[char.toLowerCase()]}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
