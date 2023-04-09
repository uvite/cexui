import type {
  SeriesMarkerPosition,
  SeriesMarkerShape,
  UTCTimestamp,
} from '@iam4x/lightweight-charts';
import { useAtomValue } from 'jotai';
import { orderBy } from 'lodash';
import { useEffect } from 'react';

import { selectedSymbolNewsAtom } from '../../atoms/app.atoms';
import type { CandleSeries } from '../../hooks/chart/chart.types';
import { newsDisplayDotsAtom } from '../../hooks/trade/use-news-trade.hooks';
import { timeToLocal } from '../../utils/time-local.utils';

export const ChartNewsComponent = ({
  candleSeries,
}: {
  candleSeries?: CandleSeries;
}) => {
  const news = useAtomValue(selectedSymbolNewsAtom);
  const enabled = useAtomValue(newsDisplayDotsAtom);

  const markers = orderBy(
    news.map((article) => ({
      time: timeToLocal(article.news.time / 1000) as UTCTimestamp,
      position: 'belowBar' as SeriesMarkerPosition,
      color: '#3772FF',
      shape: 'circle' as SeriesMarkerShape,
    })),
    ['time'],
    ['asc']
  );

  useEffect(() => {
    if (candleSeries && enabled) {
      candleSeries.setMarkers(markers);
    }

    return () => {
      if (candleSeries) {
        candleSeries.setMarkers([]);
      }
    };
  }, [candleSeries, markers, enabled]);

  return null;
};
