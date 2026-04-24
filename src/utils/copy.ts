import { showToast } from '../hooks/useToast';

export async function copyToClipboard(text: string, successMsg = 'Copied'): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg);
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(successMsg);
    } catch {
      showToast('Copy failed');
    }
  }
}
