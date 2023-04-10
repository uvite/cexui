// export type CandleSeries = {};
// export type LightweightChart = {};
// export type VolumeSeries = {};
// export type PriceLine = {};
//

import {
  MouseEventHandler,
  TimeRangeChangeEventHandler,
  IChartApi,
  SingleValueData,
  CandlestickSeriesPartialOptions,
  LineSeriesPartialOptions,
  AreaSeriesPartialOptions,
  BarSeriesPartialOptions,
  HistogramSeriesPartialOptions,
  OhlcData,
  SeriesMarker,
  ChartOptions,
  PriceLineOptions,
  createChart,
  CandlestickData,
  IPriceLine,
  ISeriesApi,
  SeriesType,
} from '@iam4x/lightweight-charts';

// eslint-disable-next-line @typescript-eslint/ban-types
export type LightweightChart = IChartApi & {};

// eslint-disable-next-line @typescript-eslint/ban-types
export type CandleSeries = ISeriesApi<any> & {};
// eslint-disable-next-line @typescript-eslint/ban-types
export type VolumeSeries = ISeriesApi<any> & {};

// eslint-disable-next-line @typescript-eslint/ban-types
interface PriceLineOptionsA extends PriceLineOptions {
  id: string;
}
export type PriceLine = {
  applyOptions(options: Partial<PriceLineOptionsA>): void;
  /**
   * Get the currently applied options.
   */
  options(): Readonly<PriceLineOptionsA>;
};
