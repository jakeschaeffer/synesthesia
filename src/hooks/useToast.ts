import { useEffect, useState } from 'react';

type ToastListener = (message: string) => void;

const listeners = new Set<ToastListener>();

export function showToast(message: string): void {
  listeners.forEach((fn) => fn(message));
}

export function useToast(duration = 1700): string | null {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const listener: ToastListener = (next) => setMessage(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  return message;
}
