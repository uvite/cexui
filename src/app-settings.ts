/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { atom } from 'jotai';
import type { Layouts } from 'react-grid-layout';
import { OrderSide } from 'safe-cex/dist/types';

import { TradeComponentType, NewsTradeType, AppBlock } from './app.types';
import type { NewsSources } from './hooks/use-news/use-news.types';
import { PriceType } from './hooks/use-ticker-price.hooks';
import type { TickersWordsMapping } from './utils/ticker-match/ticker-match.atoms';

export type AppSettings = typeof defaultSettings;

export const defaultSettings = Object.freeze({
  // APP GRID LAYOUTS
  // -----------
  layouts: {
    lg: [
      { w: 7, h: 13, x: 2, y: 0, i: AppBlock.Chart },
      { w: 5, h: 8, x: 2, y: 13, i: AppBlock.Positions },
      { w: 2, h: 8, x: 7, y: 13, i: AppBlock.Orders },
      { w: 3, h: 4, x: 9, y: 0, i: AppBlock.Account },
      { w: 3, h: 10, x: 9, y: 4, i: AppBlock.Trade },
      { w: 2, h: 10, x: 0, y: 11, i: AppBlock.Tickers },
      { w: 3, h: 7, x: 9, y: 14, i: AppBlock.TickerInfo },
      { w: 2, h: 11, x: 0, y: 0, i: AppBlock.News },
      { w: 12, h: 6, x: 0, y: 21, i: AppBlock.Logs },
    ],
    xs: [
      { w: 5, h: 10, x: 3, y: 0, i: AppBlock.Chart },
      { w: 9, h: 7, x: 0, y: 15, i: AppBlock.Positions },
      { w: 3, h: 7, x: 9, y: 15, i: AppBlock.Orders },
      { w: 4, h: 5, x: 8, y: 0, i: AppBlock.Account },
      { w: 4, h: 10, x: 8, y: 4, i: AppBlock.Trade },
      { w: 3, h: 7, x: 0, y: 8, i: AppBlock.Tickers },
      { w: 5, h: 5, x: 3, y: 10, i: AppBlock.TickerInfo },
      { w: 3, h: 8, x: 0, y: 0, i: AppBlock.News },
      { w: 12, h: 6, x: 0, y: 22, i: AppBlock.Logs },
    ],
  } as Layouts,

  // Global app settings
  // -------------------
  global: {
    privacy: false,
    sound: true,
    preview: false,
    utc: true,
    hiddenBlocks: [] as AppBlock[],
  },

  // General trading preferences
  // ---------------------------
  trading: {
    selectedSymbol: 'BTCUSDT',
    selectedComponent: TradeComponentType.AllInOne,
    sellInto: PriceType.Bid,
    buyInto: PriceType.Ask,
    maxRisk: 25,
    priceScaleRatio: 2,
    scaledOrdersCount: 10,
    side: OrderSide.Buy,
    maxMarketSlippage: 0,
    fatFingerProtection: '',
  },

  // Scale by risk specific settings
  // ----------------------------
  scaleByRisk: {
    risk: 1,
    quantityScaled: 0.5,
  },

  // TWAP specific settings
  // ----------------------
  twap: {
    length: 90,
    lotsCount: 10,
    randomness: 0.1,
  },

  // Chase specific settings
  // -----------------------
  chase: {
    percentLimit: 0.25,
    infinite: false,
    stalk: false,
  },

  // News trading preferences
  // ------------------------
  news: {
    orderType: NewsTradeType.Market,
    orderMarketSettings: { maxSlippage: 0 },
    orderTwapSettings: { length: 5, lotsCount: 5, randomness: 0.1 },
    orderLimitSettings: { distance: 0 },
    defaultSize: 1000,
    defaultTickers: [] as string[],
    sizeMap: {} as Record<string, string>,
    oldLayout: false,
    wordsBlocklist: [] as string[],
    displayDots: true,
    autoSelectTicker: false,
    tradeShortcutsEnabled: false,
    treeNewsKey: '',
    text2Speech: false,
    text2SpeechPlaybackSpeed: 1,
    customTickerWordsMapping: {} as TickersWordsMapping,
    disabledSources: [] as NewsSources[],
  },

  // Favorites tickers
  // -----------------
  favorites: [] as string[],

  // Shortcuts
  // ---------
  shortcuts: {
    // toggle app settings
    toggleFavorite: ['f'],
    togglePreview: ['p'],
    toggleSettings: [','],
    togglePrivacy: ['h'],
    toggleSound: ['m'],
    // positions navigation
    nextPosition: ['j'],
    previousPosition: ['k'],
    // trading
    searchFocus: ['/'],
    cycleTimeframes: ['l'],
    // trade components
    allInOneFocus: ['F1'],
    simpleTrade: ['F2'],
    scaleByRiskFocus: ['F3'],
    scaleBySizeFocus: ['F4'],
    twapTrade: ['F5'],
    chaseTrade: ['F6'],
    // news trading
    nextNews: ['ArrowUp'],
    previousNews: ['ArrowDown'],
    selectFirstNews: ['PageUp'],
    buyNews: ['b'],
    sellNews: ['s'],
  },
});

export const appSettingsAtom = atom<AppSettings>(defaultSettings);
