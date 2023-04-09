export enum AppBlock {
  Chart = 'chart',
  Positions = 'positions',
  Orders = 'orders',
  Account = 'account',
  Trade = 'trade',
  Tickers = 'tickers',
  TickerInfo = 'ticker-info',
  News = 'news',
  Logs = 'logs',
}

export enum NewsTradeType {
  Market = 'market',
  Limit = 'limit',
  Twap = 'twap',
  Chase = 'chase',
}

export enum TradeComponentType {
  AllInOne = 'all_in_one',
  Simple = 'simple',
  ScaleInRisk = 'scale_in_risk',
  ScaleInSize = 'scale_in_size',
  Twap = 'twap',
  Chase = 'chase',
}

export const tradeOptions = [
  { value: TradeComponentType.AllInOne, label: 'All-in-One' },
  { value: TradeComponentType.Simple, label: 'Simple' },
  { value: TradeComponentType.ScaleInRisk, label: 'Scale in by risk' },
  { value: TradeComponentType.ScaleInSize, label: 'Scale in by size' },
  { value: TradeComponentType.Twap, label: 'TWAP' },
  { value: TradeComponentType.Chase, label: 'Chase' },
];
