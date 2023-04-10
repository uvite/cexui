import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { random } from 'lodash';
import { useEffect, useRef } from 'react';
import type { OrderSide, PlaceOrderOpts } from 'safe-cex/dist/types';
import { OrderType } from 'safe-cex/dist/types';
import { v4 } from 'uuid';

import { tickersAtom } from '../../app-state';
import { fatFingerValueAtom } from '../../atoms/trade.atoms';
import { fatFingerError } from '../../utils/errors.utils';
import { addPreventClosePage, removePreventClosePage } from '../../utils/prevent-close.utils';
import { tickerRegex } from '../../utils/ticker-match/ticker-match.utils';
import { selectedAccountAtom } from '../use-accounts.hooks';
import { EventName, useAnalytics } from '../use-analytics.hooks';
import { logsAtom } from '../use-logs.hooks';
import { usePlaceOrders } from '../use-place-orders.hooks';

export interface TWAPOpts {
  symbol: string;
  size: number;
  length: number;
  lotsCount: number;
  side: OrderSide;
  reduceOnly: boolean;
  randomness: number;
}

export enum TWAPStatus {
  Iddle = 'iddle',
  Running = 'running',
  Paused = 'paused',
  Ended = 'Ended',
}

export interface TWAPState {
  symbol: string;
  size: number;
  sizeExecuted: number;
  lots: number[];
  side: OrderSide;
  status: TWAPStatus;
  lotsCount: number;
  lotsExecuted: number;
  nextOrderAt: number;
}

class TWAPManager {
  state: TWAPState;

  private opts: TWAPOpts;
  private _timeoutId: NodeJS.Timeout | undefined;
  private _updateState: (state: TWAPState) => void;
  private _placeOrders: (orders: PlaceOrderOpts[]) => Promise<any>;

  constructor(
    opts: TWAPOpts,
    updateState: (state: TWAPState) => void,
    placeOrder: (orders: PlaceOrderOpts[]) => Promise<any>,
  ) {
    this.opts = opts;

    this._updateState = updateState;
    this._placeOrders = placeOrder;

    // divide total lots by two
    // then add randomness to a lot, and do the opposite to the next one
    // if we have rest, just add the normal lot size

    const quotient = Math.floor(opts.lotsCount / 2);
    const remainder = opts.lotsCount % 2;

    const halfLots = Array(quotient).fill(opts.size / opts.lotsCount);
    const lots = halfLots.flatMap((lot) => {
      const rand = random(0, opts.randomness);
      const diff = Math.abs(lot * rand);

      const lotA = lot + diff;
      const lotB = lot - diff;

      return [lotA, lotB];
    });

    if (remainder > 0) {
      lots.push(opts.size / opts.lotsCount);
    }

    this.state = {
      symbol: this.opts.symbol,
      side: this.opts.side,
      size: this.opts.size,
      status: TWAPStatus.Iddle,
      lots,
      lotsCount: this.opts.lotsCount,
      sizeExecuted: 0,
      lotsExecuted: 0,
      nextOrderAt: 0,
    };
  }

  start = async () => {
    if (this.state.status === TWAPStatus.Iddle) {
      this.updateState({
        status: TWAPStatus.Running,
        nextOrderAt: Date.now(),
      });
    }

    const { order, orderFreq } = this.formatOrder();
    await this._placeOrders([order]);

    this.updateState({ sizeExecuted: this.state.sizeExecuted + order.amount });

    const rand = random(-this.opts.randomness, this.opts.randomness);

    const wait = orderFreq * 60 * 1000;
    const waitWithJitter = wait + wait * rand;

    const nextOrderAt = Date.now() + waitWithJitter;
    const lotsExecuted = this.state.lotsExecuted + 1;

    if (this.state.lots.length === 0) {
      this.updateState({ status: TWAPStatus.Ended, lotsExecuted });
      return false;
    }

    this.updateState({ lotsExecuted, nextOrderAt });
    this._timeoutId = setTimeout(() => this.start(), waitWithJitter);

    return true;
  };

  pause = () => {
    if (this.state.status === TWAPStatus.Running) {
      this.updateState({ status: TWAPStatus.Paused });
      if (this._timeoutId) clearTimeout(this._timeoutId);
    }
  };

  resume = () => {
    if (this.state.status === TWAPStatus.Paused) {
      const nextOrderAt = this.state.nextOrderAt > Date.now() ? this.state.nextOrderAt : Date.now();

      this._timeoutId = setTimeout(() => this.start(), nextOrderAt - Date.now());

      this.updateState({ status: TWAPStatus.Running });
    }
  };

  stop = () => {
    if (this.state.status !== TWAPStatus.Ended) {
      this.updateState({ status: TWAPStatus.Ended });
      if (this._timeoutId) clearTimeout(this._timeoutId);
    }
  };

  private formatOrder = () => {
    const lotSize = this.state.lots.shift();
    const orderFreq = this.opts.length / this.opts.lotsCount;

    if (!lotSize) {
      throw new Error('TWAP should be over by now...');
    }

    const order: PlaceOrderOpts = {
      symbol: this.opts.symbol,
      type: OrderType.Market,
      side: this.opts.side,
      amount: lotSize,
      reduceOnly: this.opts.reduceOnly,
    };

    return { order, orderFreq };
  };

  private updateState(state: Partial<TWAPState>) {
    this.state = { ...this.state, ...state };
    this._updateState(this.state);
  }
}

export const twapInstances = new Map<string, TWAPManager>();
export const twapsAtom = atom<Array<TWAPState & { id: string }>>([]);

export const useTwapTrade = () => {
  const track = useAnalytics();
  const tickers = useAtomValue(tickersAtom);
  const fatFinger = useAtomValue(fatFingerValueAtom);

  const account = useAtomValue(selectedAccountAtom);
  const currentAccount = useRef(account?.name);

  const placeOrders = usePlaceOrders();
  const log = useSetAtom(logsAtom);

  const [twaps, setTwaps] = useAtom(twapsAtom);

  const startTwap = async (opts: TWAPOpts) => {
    const ticker = tickers.find((t) => t.symbol === opts.symbol);
    const price = ticker ? ticker.last : 0;

    if (fatFinger && price * opts.size > fatFinger) {
      fatFingerError();
      return;
    }

    const id = v4();
    const updateState = (state: TWAPState) => {
      setTwaps((t) => t.map((t2) => (t2.id === id ? { ...t2, ...state } : t2)));
    };

    const twap = new TWAPManager(opts, updateState, placeOrders);

    setTwaps((t) => [...t, { ...twap.state, id }]);
    twapInstances.set(id, twap);

    log(
      `[USER] Start TWAP ${opts.side.toUpperCase()} ${opts.size} ${opts.symbol.replace(
        tickerRegex,
        '',
      )}`,
    );

    try {
      const started = await twap.start();

      if (started) {
        addPreventClosePage();
        track(EventName.Trade, {
          from: 'twap',
          order: {
            symbol: opts.symbol,
            side: opts.side,
            amount: opts.size,
            price,
          },
        });
      }
    } catch {
      // do nothing, error would already be reported
    }
  };

  const pauseTwap = (id: string) => {
    const twap = twapInstances.get(id);
    if (twap) twap.pause();
  };

  const resumeTwap = (id: string) => {
    const twap = twapInstances.get(id);
    if (twap) twap.resume();
  };

  const stopTwap = (id: string) => {
    const twap = twapInstances.get(id);
    if (twap) {
      twap.stop();
      twapInstances.delete(id);

      setTwaps((t) => {
        const next = t.filter((t2) => t2.id !== id);
        if (next.length === 0) removePreventClosePage();
        return next;
      });
    }
  };

  const stopAll = () => {
    twapInstances.forEach((t) => t.stop());
    twapInstances.clear();
    setTwaps([]);
    removePreventClosePage();
  };

  useEffect(() => {
    if (account?.name !== currentAccount.current) {
      currentAccount.current = account?.name;
      twapInstances.forEach((t) => t.stop());
      twapInstances.clear();
      setTwaps([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.name]);

  return {
    twaps: twaps.filter((t) => t.status !== TWAPStatus.Ended),
    startTwap,
    pauseTwap,
    resumeTwap,
    stopTwap,
    stopAll,
  };
};
