import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { uniqBy, orderBy } from 'lodash';
import { v4 } from 'uuid';

import { appSettingsAtom } from '../app-settings';
import type { NewsWithSymbols } from '../hooks/use-news/use-news.types';

import { selectedSymbolAtom } from './trade.atoms';

// UI STATE
export const layoutsAtom = focusAtom(appSettingsAtom, (o) => o.prop('layouts'));

export const privacyAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('global').prop('privacy')
);

export const displayPreviewTradeAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('global').prop('preview')
);

export const togglePreviewAtom = atom(null, (get, set) =>
  set(displayPreviewTradeAtom, !get(displayPreviewTradeAtom))
);

export const soundAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('global').prop('sound')
);

export const utcAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('global').prop('utc')
);

export const utcToggleAtom = atom(
  (get) => get(utcAtom),
  (get, set) => set(utcAtom, !get(utcAtom))
);

export const isMutedAtom = atom((get) => !get(soundAtom));
export const toggleSoundAtom = atom(null, (get, set) =>
  set(soundAtom, !get(soundAtom))
);

export const hiddenBlocksAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('global').prop('hiddenBlocks')
);

export const newsSearchAtom = atom('');
export const _messageHistoryAtom = atom<NewsWithSymbols[]>([]);

export const messageHistoryAtom = atom(
  (get) => {
    const messages = get(_messageHistoryAtom);
    const search = get(newsSearchAtom).trim();

    if (!search || search.length < 3) return messages;

    return messages.filter(
      (m) =>
        m.news.content.toLowerCase().includes(search.toLowerCase()) ||
        m.news.author.toLowerCase().includes(search.toLowerCase()) ||
        m.symbols.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    );
  },
  (_get, set, value: NewsWithSymbols[]) => set(_messageHistoryAtom, value)
);

export const setMessageHistoryAtom = atom(
  null,
  (get, set, news: NewsWithSymbols[]) => {
    const prev = get(_messageHistoryAtom);

    const withoutEmpty = news.filter((n) => n.news.content.length > 2);
    const withId = withoutEmpty.map((n) => ({ ...n, id: n.id || v4() }));

    const withoutDuplicates = uniqBy(
      prev.concat(...withId),
      ({ news: { content, author } }) => content + author
    );

    const ordered = orderBy(withoutDuplicates, ['news.time'], ['desc']);
    set(_messageHistoryAtom, ordered as NewsWithSymbols[]);
  }
);

export const selectedSymbolNewsAtom = atom((get) => {
  const news = get(_messageHistoryAtom);
  const symbol = get(selectedSymbolAtom);

  return news.filter((n) => n.symbols.includes(symbol));
});
