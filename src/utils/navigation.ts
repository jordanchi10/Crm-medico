/**
 * Cross-platform external link & WhatsApp dispatcher.
 * Avoids popup blocker issues in mobile browsers (iOS Safari, Chrome for Android)
 * by synthesizing an anchor click with target="_blank" and rel="noopener noreferrer".
 */
export function openExternalLink(url: string): void {
  if (!url) return;
  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    // Must be in the DOM for certain iOS Safari WebViews
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
