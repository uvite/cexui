import type { UTCTimestamp } from '@iam4x/lightweight-charts';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useContext, useEffect, useRef } from 'react';

import { marketsAtom, selectedAtom } from '../../app-state';
import { selectedSymbolAtom } from '../../atoms/trade.atoms';
import { afterDecimal } from '../../utils/after-decimal.utils';
import { timeToLocal } from '../../utils/time-local.utils';
import { ConnectorContext } from '../use-exchange-connector.hooks';
import { selectedTimeframeAtom } from '../use-timeframe.hooks';

import type {
  CandleSeries,
  LightweightChart,
  VolumeSeries,
} from './chart.types';
import { lastOHLCAtom, lastVolumeAtom } from './use-ohlc.hooks';

export const useDrawKline = ({
  candleSeries,
  volumeSeries,
  chart,
}: {
  candleSeries?: CandleSeries;
  volumeSeries?: VolumeSeries;
  chart?: LightweightChart;
}) => {
  const symbolRef = useRef<string>();
  const intervalRef = useRef<string>();

  const [symbol, setSymbol] = useAtom(selectedSymbolAtom);
  const interval = useAtomValue(selectedTimeframeAtom);

  const { market } = useAtomValue(selectedAtom);

  const precision = afterDecimal(market?.precision?.price ?? '0.0001');
  const minMove = 1 / 10 ** precision;

  const setLastHOLC = useSetAtom(lastOHLCAtom);
  const setLastVolume = useSetAtom(lastVolumeAtom);

  const connector = useContext(ConnectorContext);
  const markets = useAtomValue(marketsAtom);

  useEffect(() => {
    let dispose: () => void;

    symbolRef.current = symbol;
    intervalRef.current = interval;

    const hasSymbol = markets.some((m) => m.symbol === symbol);

    if (!hasSymbol && markets.length > 0) {
      // if the symbol is not available, fallback to BTC
      // if BTC is not available, fallback to the first market
      setSymbol(
        (markets.find((m) => m.symbol.includes('BTC')) || markets[0]).symbol
      );
    }

    if (chart && candleSeries && volumeSeries && connector && hasSymbol) {
      connector
        ?.fetchOHLCV({ symbol, interval })
        .then((candles) =>
          candles.map((c) => ({
            ...c,
            time: timeToLocal(c.timestamp) as UTCTimestamp,
          }))
        )
        .then((candles) => {
          if (
            symbol === symbolRef.current &&
            interval === intervalRef.current
          ) {
            candleSeries?.setData(candles);
            volumeSeries?.setData(
              candles.map(({ time, volume: value }) => ({ time, value }))
            );

            if (candles.length) {
              const fromCandlesIdx =
                candles.length - 150 > 0 ? candles.length - 150 : 0;

              chart?.priceScale().applyOptions({ autoScale: true });
              chart?.timeScale().setVisibleRange({
                to: candles[candles.length - 1].time,
                from: candles[fromCandlesIdx].time,
              });

              chart?.timeScale().applyOptions({ rightOffset: 20 });
              candleSeries?.applyOptions({
                priceFormat: { type: 'price', precision, minMove },
              });
            }

            dispose = connector?.listenOHLCV({ symbol, interval }, (c) => {
              const candle = {
                ...c,
                time: timeToLocal(c.timestamp) as UTCTimestamp,
              };

              if (
                symbol === symbolRef.current &&
                interval === intervalRef.current
              ) {
                try {
                  candleSeries?.update(candle);
                  volumeSeries?.update({
                    time: candle.time,
                    value: candle.volume,
                  });

                  setLastHOLC(candle);
                  setLastVolume(candle.volume);
                } catch {
                  // do nothing, sometimes the updated candle is not the last one
                  // "Cannot update oldest data, last time=1676598600, new time=1676598540"
                }
              } else {
                dispose?.();
              }
            });
          }
        });
    }

    return () => {
      candleSeries?.setData([]);
      volumeSeries?.setData([]);
      dispose?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connector, symbol, interval, chart, candleSeries, volumeSeries, markets]);
};
