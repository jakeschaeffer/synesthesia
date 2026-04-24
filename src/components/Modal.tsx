import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  onClose: () => void;
  label: string;
  title: string;
  children: ReactNode;
}

export function Modal({ onClose, label, title, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-label={title}>
        <div className="modal-head">
          <div>
            <div className="label">{label}</div>
            <h2>{title}</h2>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            Close ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
