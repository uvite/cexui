import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { memoize, merge } from 'lodash';

import { appSettingsAtom } from '../../app-settings';
import { marketsAtom } from '../../app-state';
import type { News } from '../../hooks/use-news/use-news.types';

import { matchTickers } from './ticker-match.utils';

export type TickersWordsMapping = Record<string, string[]>;
export type TickersWordsCommon = string[];

export const tickersWordsMappingAtom = atom<TickersWordsMapping>({});
export const tickersWordsCommonAtom = atom<TickersWordsCommon>([]);
export const customTickerWordsMappingAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('news').prop('customTickerWordsMapping')
);

export const allTickerWordsMappingAtom = atom((get) => {
  const customMapping = get(customTickerWordsMappingAtom);
  const defaultMapping = get(tickersWordsMappingAtom);
  return merge({}, defaultMapping, customMapping);
});

export const matchTickersAtom = atom((get) => {
  const tickersWordsMapping = get(allTickerWordsMappingAtom);
  const tickersWordsCommon = get(tickersWordsCommonAtom);
  const tickers = get(marketsAtom).map((s) => s.symbol);

  return memoize(
    matchTickers({ tickersWordsMapping, tickersWordsCommon, tickers }),
    (message: News) => ('body' in message ? message.body : message.title)
  );
});
