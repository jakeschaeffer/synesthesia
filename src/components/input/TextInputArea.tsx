import { useCallback, useMemo, useRef, useState } from 'react';
import { useSynesthesiaStore } from '../../store/useSynesthesiaStore';
import { ColoredLetter } from './ColoredLetter';
import { ShareWordColorDialog } from '../share/ShareWordColorDialog';

export function TextInputArea() {
  const text = useSynesthesiaStore((s) => s.text);
  const setText = useSynesthesiaStore((s) => s.setText);
  const colorMap = useSynesthesiaStore((s) => s.colorMap);
  const gradientSettings = useSynesthesiaStore((s) => s.gradientSettings);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sharedTextLayoutClasses =
    'absolute inset-0 w-full h-full px-8 py-6 font-mono text-3xl leading-9 text-center whitespace-pre-wrap break-words';
  const [shareOpen, setShareOpen] = useState(false);
  const canShare = useMemo(() => text.trim().length > 0, [text]);

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
        className={`${sharedTextLayoutClasses} resize-none bg-transparent text-transparent caret-white/50 outline-none z-10`}
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

      <button
        onClick={() => setShareOpen(true)}
        disabled={!canShare}
        className="absolute right-4 bottom-3 z-30 px-2.5 py-1.5 text-[10px] text-white/45 hover:text-white/75 bg-white/5 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed rounded transition-colors"
      >
        Share word/color pair
      </button>

      <ShareWordColorDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        text={text}
        colorMap={colorMap}
        gradientSettings={gradientSettings}
      />
    </div>
  );
}
