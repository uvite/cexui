import type { PriceLineOptions } from '@iam4x/lightweight-charts';
import { useEffect, useMemo, useRef } from 'react';

import type { CandleSeries, PriceLine } from '../../hooks/chart/chart.types';

export const ChartLineComponent = ({
  candleSeries,
  line,
}: {
  candleSeries?: CandleSeries;
  line: PriceLineOptions;
}) => {
  const priceLine = useRef<PriceLine>();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const priceLineOpts = useMemo(() => line, [JSON.stringify(line)]);

  // create or update line
  useEffect(() => {
    if (candleSeries && priceLine.current) {
      priceLine.current.applyOptions(priceLineOpts);
    } else if (candleSeries && !priceLine.current) {
      priceLine.current = candleSeries.createPriceLine(priceLineOpts);
    }
  }, [candleSeries, priceLineOpts]);

  // delete line on unmount
  // we re-use the same lines if only props changes
  // this is to avoid flickering when the line is re-created
  useEffect(() => {
    return () => {
      if (candleSeries && priceLine.current) {
        candleSeries.removePriceLine(priceLine.current);
        priceLine.current = undefined;
      }
    };
  }, [candleSeries]);

  return null;
};
