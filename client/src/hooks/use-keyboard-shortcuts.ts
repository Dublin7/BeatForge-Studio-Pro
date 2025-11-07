import { useEffect } from 'react';

interface KeyboardShortcuts {
  onPlayPause?: () => void;
  onStop?: () => void;
  onSave?: () => void;
  onReset?: () => void;
}

export function useKeyboardShortcuts({
  onPlayPause,
  onStop,
  onSave,
  onReset
}: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          onPlayPause?.();
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onSave?.();
          } else {
            e.preventDefault();
            onStop?.();
          }
          break;
        case 'r':
          e.preventDefault();
          onReset?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause, onStop, onSave, onReset]);
}
