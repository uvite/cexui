import { atom, useAtom, useAtomValue } from 'jotai';
import { focusAtom } from 'jotai-optics';

import { appSettingsAtom } from '../../app-settings';
import { messageHistoryAtom } from '../../atoms/app.atoms';

export const newsTradeTypeAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('orderType'),
);

export const newsTradeTwapSettingsAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('orderTwapSettings'),
);

export const newsTradeLimitSettingsAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('orderLimitSettings'),
);

export const newsTradeMarketSettingsAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('orderMarketSettings'),
);

export const tickerTradeSizeMapAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('sizeMap'),
);

export const newsDefaultTradeSizeAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('defaultSize'),
);

export const newsDefaultTickersAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('defaultTickers'),
);

export const newsOldLayoutAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('oldLayout'),
);

export const newsBlocklistAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('wordsBlocklist'),
);

export const newsDisplayDotsAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('displayDots'),
);

export const newsAutoSelectTickerAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('autoSelectTicker'),
);

export const newsTradeShortcutsEnabledAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('tradeShortcutsEnabled'),
);

export const treeNewsKeyAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('treeNewsKey'),
);

export const newsDisabledSourcesAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('disabledSources'),
);

export const newsText2SpeechAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('text2Speech'),
);

export const newsText2SpeechPlaybackSpeedAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('text2SpeechPlaybackSpeed'),
);

export const useTickerTradeSizeMap = (symbol: string) => {
  const defaultSize = useAtomValue(newsDefaultTradeSizeAtom);
  const [tickerTradeSizeMap, setTickerTradeSizeMap] = useAtom(tickerTradeSizeMapAtom);

  const size =
    typeof tickerTradeSizeMap[symbol] === 'undefined'
      ? defaultSize.toString()
      : tickerTradeSizeMap[symbol];

  const setSize = (value: string) => {
    setTickerTradeSizeMap((prev) => ({ ...prev, [symbol]: value }));
  };

  return [size, setSize] as const;
};

export const selectedNewsAtom = atom<string | null>(null);

export const selectFirstNewsAtom = atom(null, (get, set) => {
  const news = get(messageHistoryAtom);
  set(selectedNewsAtom, news[0].id);
});

export const selectPreviousNewsAtom = atom(null, (get, set) => {
  const news = get(messageHistoryAtom);
  const selected = get(selectedNewsAtom);

  const index = news.findIndex((n) => n.id === selected);
  const nextIndex = index + 1;

  if (nextIndex < news.length) {
    set(selectedNewsAtom, news[nextIndex].id);
  } else {
    set(selectedNewsAtom, news[news.length - 1].id);
  }
});

export const selectNextNewsAtom = atom(null, (get, set) => {
  const news = get(messageHistoryAtom);
  const selected = get(selectedNewsAtom);

  const index = news.findIndex((n) => n.id === selected);
  const nextIndex = index - 1;

  if (nextIndex >= 0) {
    set(selectedNewsAtom, news[nextIndex].id);
  } else {
    set(selectedNewsAtom, news[0].id);
  }
});
