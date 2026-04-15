import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  onUndo?: () => void;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onUndo, onClose, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 200); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-2xl transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <span className="text-sm text-white/80">{message}</span>
      {onUndo && (
        <button
          onClick={() => {
            onUndo();
            onClose();
          }}
          className="text-sm text-blue-400/80 hover:text-blue-400 transition-colors font-medium"
        >
          Undo
        </button>
      )}
    </div>
  );
}
