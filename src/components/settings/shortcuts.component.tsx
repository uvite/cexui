import { useAtom } from 'jotai';
import React, { useState } from 'react';

import type { AppSettings } from '../../app-settings';
import { shortcutsAtom } from '../../hooks/use-shortcuts.hooks';

type Shortcuts = AppSettings['shortcuts'];

const shortcutsLayout: Array<{
  category: string;
  shortcuts: Partial<Record<keyof Shortcuts, string>>;
}> = [
  {
    category: 'General',
    shortcuts: {
      toggleSettings: 'Open settings',
      togglePrivacy: 'Toggle privacy mode',
      toggleSound: 'Toggle sound',
    },
  },
  {
    category: 'Chart',
    shortcuts: {
      cycleTimeframes: 'Change chart timeframe',
      togglePreview: 'Toggle preview trade chart lines',
    },
  },
  {
    category: 'Tickers',
    shortcuts: {
      searchFocus: 'Focus search tickers',
      toggleFavorite: 'Toggle symbol from favorites',
    },
  },
  {
    category: 'Positions',
    shortcuts: {
      nextPosition: 'Select next position',
      previousPosition: 'Select previous position',
    },
  },
  {
    category: 'Trade',
    shortcuts: {
      scaleByRiskFocus: 'Select scale by risk trade',
      scaleBySizeFocus: 'Select scale by size trade',
      allInOneFocus: 'Select all in one trade',
      simpleTrade: 'Select simple orders',
      twapTrade: 'Select TWAP orders',
      chaseTrade: 'Select chase orders',
    },
  },
  {
    category: 'News',
    shortcuts: {
      selectFirstNews: 'Select first news',
      nextNews: 'Select next news',
      previousNews: 'Select previous news',
      buyNews: 'Buy news',
      sellNews: 'Sell news',
    },
  },
];

export const ShortcutsComponent = () => {
  const [assignedShortcuts, setShortcuts] = useAtom(shortcutsAtom);
  const [editing, setEditing] = useState(false);

  const handleChangeKeycap = (shortcutKey: keyof Shortcuts) => {
    if (!editing) {
      setEditing(true);

      const selectedKeys: string[] = [];

      const listener = ({ key }: KeyboardEvent) => {
        if (!selectedKeys.includes(key)) {
          selectedKeys.push(key);
        }
      };

      const listener2 = () => {
        setShortcuts({ [shortcutKey]: selectedKeys });
        setEditing(false);
        window.removeEventListener('keydown', listener);
        window.removeEventListener('keyup', listener2);
      };

      window.addEventListener('keydown', listener);
      window.addEventListener('keyup', listener2);
    }
  };

  return (
    <div className="relative overflow-hidden px-2 py-3">
      {editing && (
        <div className="absolute top-[100px] z-10 w-[550px]">
          <div className="bg-dark-blue mx-auto w-3/4 rounded-md px-3 py-4 text-center font-semibold">
            Press and release keys to change the shortcut.
          </div>
        </div>
      )}

      <div className={editing ? 'blur-sm' : ''}>
        <h1 className="text-lg font-bold">Shortcuts</h1>
        <p className="text-dark-text-gray py-2 text-sm">
          You can adjust the shortcuts to your liking.
          <br />
          The shortcuts are global and will work anywhere in the app.
        </p>

        <div>
          {shortcutsLayout.map(({ category, shortcuts }) => (
            <div key={category} className="mb-3 last:mb-0">
              <div className="mb-1 text-lg font-bold">{category}</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(shortcuts).map(([shortcut, description]) => (
                  <div
                    key={shortcut}
                    className="border-dark-border-gray flex items-center rounded-sm border px-2 py-1"
                  >
                    <div className="text-dark-text-white/70 text-sm font-medium">{description}</div>
                    <div className="ml-auto pb-0.5 text-right">
                      <span
                        className="group cursor-pointer"
                        onClick={() => handleChangeKeycap(shortcut as keyof Shortcuts)}
                      >
                        {assignedShortcuts[shortcut as keyof Shortcuts].map((key, idx) => (
                          <span key={key}>
                            {idx > 0 && <span className="mx-1">+</span>}
                            <kbd className="keycap mr-1 last:mr-0 group-hover:border-sky-300">
                              {key}
                            </kbd>
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
