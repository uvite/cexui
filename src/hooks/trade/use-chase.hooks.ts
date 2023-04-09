import { proxy, useSnapshot } from '@iam4x/valtio';
import { useAtomValue, useSetAtom } from 'jotai';
import { useContext, useEffect, useRef } from 'react';
import type { Exchange } from 'safe-cex/dist/exchanges/base';
import type { Order, Position, Store } from 'safe-cex/dist/types';
import {
  OrderTimeInForce,
  OrderType,
  OrderSide,
  PositionSide,
} from 'safe-cex/dist/types';
import { v4 } from 'uuid';

import { TradeComponentType } from '../../app.types';
import { fatFingerValueAtom, selectedTradeAtom } from '../../atoms/trade.atoms';
import { fatFingerError } from '../../utils/errors.utils';
import { floorStep } from '../../utils/floor-step.utils';
import {
  addPreventClosePage,
  removePreventClosePage,
} from '../../utils/prevent-close.utils';
import { tickerRegex } from '../../utils/ticker-match/ticker-match.utils';
import { selectedAccountAtom } from '../use-accounts.hooks';
import { EventName, useAnalytics } from '../use-analytics.hooks';
import { ConnectorContext } from '../use-exchange-connector.hooks';
import { logsAtom } from '../use-logs.hooks';

export interface ChaseOpts {
  symbol: string;
  size: number;
  side: OrderSide;
  min: number;
  max: number;
  distance: number;
  reduceOnly?: boolean;
  stalk?: boolean;
}

type Chases = Array<{ id: string; chase: ChaseManager }>;
const chasesProxy = proxy<Chases>([]);

const priceK: Record<OrderSide, 'ask' | 'bid'> = {
  [OrderSide.Buy]: 'bid',
  [OrderSide.Sell]: 'ask',
};

export class ChaseManager {
  id: string;
  opts: ChaseOpts;
  exchange: Exchange;
  fatFinger: number;

  watchedOrderIds: string[] = [];
  isUpdatingOrders = false;

  minTicksDistance = 1;

  constructor(
    id: string,
    opts: ChaseOpts,
    exchange: Exchange,
    fatFinger: number
  ) {
    this.id = id;
    this.opts = opts;
    this.exchange = exchange;
    this.fatFinger = fatFinger;
  }

  get price() {
    const market = this.exchange.store.markets.find(
      (m) => m.symbol === this.opts.symbol
    );

    const ticker = this.exchange.store.tickers.find(
      (t) => t.symbol === this.opts.symbol
    );

    if (!ticker || !market) {
      throw new Error(`No ticker/market found for ${this.opts.symbol}`);
    }

    const pPrice = market.precision.price;
    const sidePrice = ticker[priceK[this.opts.side]];

    if (!this.opts.stalk) {
      return floorStep(
        this.opts.side === OrderSide.Buy
          ? sidePrice - pPrice * this.minTicksDistance
          : sidePrice + pPrice * this.minTicksDistance,
        pPrice
      );
    }

    const distanceInUsd = (sidePrice * this.opts.distance) / 100;

    return floorStep(
      this.opts.side === OrderSide.Sell
        ? sidePrice + distanceInUsd
        : sidePrice - distanceInUsd,
      pPrice
    );
  }

  start = async () => {
    if (this.fatFinger && this.opts.size * this.price > this.fatFinger) {
      fatFingerError();
      this.handleChaseFinished();
      return false;
    }

    this.watchedOrderIds = await this.tryPlaceOrder();

    if (this.watchedOrderIds.length > 0) {
      this.exchange.on('update', this.onExchangeStoreUpdate);
      return true;
    }

    this.handleChaseFinished();
    return false;
  };

  tryPlaceOrder = async (tries = 1): Promise<string[]> => {
    if (tries > 10) return [];

    const orderIds = await this.exchange.placeOrder({
      symbol: this.opts.symbol,
      side: this.opts.side,
      type: OrderType.Limit,
      price: this.price,
      amount: this.opts.size,
      reduceOnly: this.opts.reduceOnly,
      timeInForce: OrderTimeInForce.PostOnly,
    });

    if (orderIds.length > 0) {
      return orderIds;
    }

    this.minTicksDistance += 1;
    return this.tryPlaceOrder(tries + 1);
  };

  onExchangeStoreUpdate = (update: Store) => {
    const orders = update.orders.filter((o) =>
      this.watchedOrderIds.includes(o.id)
    );

    if (orders.length) {
      this.adjustOrders(orders);
    }

    if (!orders.length && !this.isUpdatingOrders) {
      // we have finished the chase
      this.handleChaseFinished();
    }
  };

  adjustOrders = async (orders: Order[]) => {
    if (this.isUpdatingOrders) return;
    this.isUpdatingOrders = true;

    const lastOrderPrice = orders[0].price;
    const tickerPrice = this.price;

    // ticker price moved toward the order price
    // we dont want to update the order price
    if (
      !this.opts.stalk &&
      ((this.opts.side === OrderSide.Buy && tickerPrice < lastOrderPrice) ||
        (this.opts.side === OrderSide.Sell && tickerPrice > lastOrderPrice))
    ) {
      this.isUpdatingOrders = false;
    }
    // if the ticker moved away from the order price
    // we want to update the order to the new bid/ask price to chase
    else if (
      tickerPrice !== lastOrderPrice &&
      tickerPrice > this.opts.min &&
      tickerPrice < this.opts.max
    ) {
      await this.exchange.cancelOrders(orders);
      this.watchedOrderIds = await this.tryPlaceOrder();
    }

    this.isUpdatingOrders = false;
  };

  stop = () => {
    this.exchange.cancelOrders(
      this.exchange.store.orders.filter((o) =>
        this.watchedOrderIds.includes(o.id)
      )
    );
    this.handleChaseFinished();
  };

  handleChaseFinished = () => {
    this.exchange.off('update', this.onExchangeStoreUpdate);
    const idx = chasesProxy.findIndex((c) => c.id === this.id);
    if (idx > -1) chasesProxy.splice(idx, 1);

    if (chasesProxy.length === 0) {
      removePreventClosePage();
    }
  };
}

export const useChaseTrade = () => {
  const track = useAnalytics();
  const log = useSetAtom(logsAtom);
  const fatFinger = useAtomValue(fatFingerValueAtom);

  const exchange = useContext(ConnectorContext);
  const chases = useSnapshot(chasesProxy);

  const account = useAtomValue(selectedAccountAtom);
  const currentAccount = useRef(account?.name);

  const startChase = async (opts: ChaseOpts) => {
    if (exchange) {
      const chase = new ChaseManager(v4(), opts, exchange, fatFinger);
      chasesProxy.push({ id: chase.id, chase });

      const started = await chase.start();

      if (started) {
        addPreventClosePage();

        log(
          `[USER] Start CHASE ${opts.side.toUpperCase()} ${
            opts.size
          } ${opts.symbol.replace(tickerRegex, '')}`
        );

        track(EventName.Trade, {
          from: 'chase',
          order: {
            symbol: opts.symbol,
            side: opts.side,
            amount: opts.size,
            price: chase.price,
            reduceOnly: opts.reduceOnly,
          },
        });
      }
    }
  };

  useEffect(() => {
    if (account?.name !== currentAccount.current) {
      currentAccount.current = account?.name;
      chasesProxy.forEach((c) => c.chase.stop());
      chasesProxy.splice(0);
      removePreventClosePage();
    }
  }, [account?.name]);

  return {
    startChase,
    chases: chases as Chases,
  };
};

export const useIsChasing = () => {
  const chases = useSnapshot(chasesProxy);
  return chases.length > 0;
};

const iSide: Record<PositionSide, OrderSide> = {
  [PositionSide.Long]: OrderSide.Buy,
  [PositionSide.Short]: OrderSide.Sell,
};

const rSide: Record<PositionSide, OrderSide> = {
  [PositionSide.Long]: OrderSide.Sell,
  [PositionSide.Short]: OrderSide.Buy,
};

export const useChasePositions = () => {
  const { startChase } = useChaseTrade();
  const setSelectedTrade = useSetAtom(selectedTradeAtom);

  const chasePosition = async ({
    position,
    factor,
  }: {
    position: Position;
    factor: number;
  }) => {
    const reduceOnly = factor < 0;
    const side = reduceOnly ? rSide[position.side] : iSide[position.side];

    const opts = {
      symbol: position.symbol,
      size: Math.abs(position.contracts * factor),
      side,
      distance: 0,
      min: 0,
      max: Infinity,
      stalk: false,
      reduceOnly,
    };

    await startChase(opts);
    setSelectedTrade(TradeComponentType.Chase);
  };

  const chasePositions = async ({
    positions,
    factor,
  }: {
    positions: Position[];
    factor: number;
  }) => {
    for (const position of positions) {
      await chasePosition({ position, factor });
    }
  };

  return chasePositions;
};
