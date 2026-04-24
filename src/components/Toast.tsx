import { useToast } from '../hooks/useToast';

export function Toast() {
  const msg = useToast();
  return (
    <div className={`toast${msg ? ' show' : ''}`} role="status" aria-live="polite">
      {msg ?? ''}
    </div>
  );
}
