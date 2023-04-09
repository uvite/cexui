import mousetrap from 'mousetrap';
import { useEffect } from 'react';

export interface Shortcut {
  keys: string[];
  onEvent: (event: KeyboardEvent) => void;
  disabled?: boolean;
}

const replaceKey = (key: string) => {
  if (key === 'ArrowUp') return 'up';
  if (key === 'ArrowDown') return 'down';
  if (key === 'ArrowLeft') return 'left';
  if (key === 'ArrowRight') return 'right';
  if (key === 'PageUp') return 'pageup';
  if (key === 'PageDown') return 'pagedown';
  return key;
};

export const joinKeys = (keys: string[]) => {
  return keys.map((key) => replaceKey(key)).join('+');
};

export const useKeyBindings = (shortcuts: Shortcut[], active?: boolean) => {
  const bind = (shortcut: Shortcut) => {
    if (!shortcut.disabled) {
      mousetrap.bind(joinKeys(shortcut.keys), shortcut.onEvent);
    }
  };

  const unbind = (shortcut: Shortcut) => {
    mousetrap.unbind(joinKeys(shortcut.keys));
  };

  useEffect(() => {
    let binded: Shortcut[] = [];

    if (active) {
      shortcuts.forEach(bind);
      binded = shortcuts;
    }

    return () => {
      binded.forEach(unbind);
    };
  }, [shortcuts, active]);
};
