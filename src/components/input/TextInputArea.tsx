import { useCallback, useRef } from 'react';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';
import { ColoredLetter } from './ColoredLetter';

export function TextInputArea() {
  const text = useSynesthesiaStore((s) => s.text);
  const setText = useSynesthesiaStore((s) => s.setText);
  const colorMap = useSynesthesiaStore((s) => s.colorMap);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
    },
    [setText],
  );

  return (
    <div className="relative flex-1 min-h-[120px]">
      {/* Invisible textarea for actual input */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-white/50 outline-none p-4 font-mono text-xl z-10"
        placeholder=""
        spellCheck={false}
        autoComplete="off"
      />

      {/* Colored letter overlay */}
      <div
        className="absolute inset-0 w-full h-full p-4 font-mono text-xl whitespace-pre-wrap break-words pointer-events-none z-20"
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
