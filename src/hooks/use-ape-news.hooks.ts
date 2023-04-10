import { useAtomValue, useSetAtom } from 'jotai';
import type { PlaceOrderOpts } from 'safe-cex/dist/types';
import { OrderSide, OrderType } from 'safe-cex/dist/types';

import { marketsAtom, tickersAtom } from '../app-state';
import { NewsTradeType, TradeComponentType } from '../app.types';
import { selectedSymbolAtom, selectedTradeAtom } from '../atoms/trade.atoms';
import { errorToast } from '../notifications/error.toast';
import { pFloat } from '../utils/parse-float.utils';

import { useChaseTrade } from './trade/use-chase.hooks';
import {
  newsDefaultTradeSizeAtom,
  newsTradeLimitSettingsAtom,
  newsTradeMarketSettingsAtom,
  newsTradeTwapSettingsAtom,
  newsTradeTypeAtom,
  tickerTradeSizeMapAtom,
} from './trade/use-news-trade.hooks';
import { useTwapTrade } from './trade/use-twap.hooks';
import { EventName, useAnalytics } from './use-analytics.hooks';
import { usePlaceOrders } from './use-place-orders.hooks';

export type ApeOpts = {
  symbol: string;
  side: OrderSide;
};

export const tradeTypeOrderTypeMap = {
  [NewsTradeType.Market]: OrderType.Market,
  [NewsTradeType.Limit]: OrderType.Limit,
};

export const useApeNews = () => {
  const track = useAnalytics();
  const placeOrders = usePlaceOrders();
  const { startTwap } = useTwapTrade();
  const { startChase } = useChaseTrade();

  const markets = useAtomValue(marketsAtom);
  const tickers = useAtomValue(tickersAtom);
  const tradeType = useAtomValue(newsTradeTypeAtom);
  const twapSettings = useAtomValue(newsTradeTwapSettingsAtom);
  const limitSettings = useAtomValue(newsTradeLimitSettingsAtom);
  const marketSettings = useAtomValue(newsTradeMarketSettingsAtom);

  const setSelected = useSetAtom(selectedSymbolAtom);
  const setSelectedTrade = useSetAtom(selectedTradeAtom);

  const tickerTradeSizeMap = useAtomValue(tickerTradeSizeMapAtom);
  const defaultSize = useAtomValue(newsDefaultTradeSizeAtom);

  const ape = async (opts: ApeOpts) => {
    const market = markets.find((m) => m.symbol === opts.symbol);
    const ticker = tickers.find((t) => t.symbol === opts.symbol);

    if (!market || !ticker) {
      errorToast(`Could not find market for ${opts.symbol}`);
      return;
    }

    const size = pFloat(
      typeof tickerTradeSizeMap[opts.symbol] === 'undefined'
        ? defaultSize.toString()
        : tickerTradeSizeMap[opts.symbol],
    );

    if (size === 0 || Number.isNaN(size)) {
      errorToast(`Invalid trade size: ${size}`);
      return;
    }

    setSelected(ticker.symbol);
    const amount = size / ticker.last;

    if (tradeType === NewsTradeType.Chase) {
      setSelectedTrade(TradeComponentType.Chase);
      startChase({
        symbol: ticker.symbol,
        size: amount,
        side: opts.side,
        distance: 0,
        min: 0,
        max: Infinity,
        stalk: false,
        reduceOnly: false,
      });
    }

    if (tradeType === NewsTradeType.Twap) {
      setSelectedTrade(TradeComponentType.Twap);
      startTwap({
        symbol: ticker.symbol,
        side: opts.side,
        size: amount,
        length: twapSettings.length,
        lotsCount: twapSettings.lotsCount,
        randomness: 0.1,
        reduceOnly: false,
      });
    }

    if (tradeType === NewsTradeType.Market || tradeType === NewsTradeType.Limit) {
      const order: PlaceOrderOpts = {
        symbol: ticker.symbol,
        type: tradeTypeOrderTypeMap[tradeType],
        side: opts.side,
        amount,
      };

      if (tradeType === NewsTradeType.Limit && limitSettings.distance !== 0) {
        const priceDistance = (limitSettings.distance * ticker.last) / 100;
        const orderPrice =
          opts.side === OrderSide.Buy ? ticker.last - priceDistance : ticker.last + priceDistance;

        order.price = orderPrice;
      }

      if (tradeType === NewsTradeType.Market && marketSettings.maxSlippage > 0) {
        const priceDistance = (marketSettings.maxSlippage * ticker.last) / 100;
        const orderPrice =
          opts.side === OrderSide.Buy ? ticker.last + priceDistance : ticker.last - priceDistance;

        order.type = OrderType.Limit;
        order.price = orderPrice;
      }

      const orderIds = await placeOrders([order]);

      if (orderIds.length > 0) {
        track(EventName.Trade, {
          from: 'news',
          order: {
            symbol: ticker.symbol,
            amount,
            side: opts.side,
            price: ticker.last,
          },
        });
      }
    }
  };

  return ape;
};
