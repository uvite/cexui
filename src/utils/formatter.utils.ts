import { take, takeRight } from 'lodash';

import { pFloat } from './parse-float.utils';
import { formatPercentage } from './percentage.utils';

export type AvailableCurrencies = 'btc' | 'eth' | 'eur' | 'usd';

const cryptoCurrencyFormatter = (currency: 'btc' | 'eth') => {
  const symbol = currency === 'btc' ? '₿' : 'Ξ';
  const decimals = currency === 'btc' ? 5 : 3;
  return {
    format: (v: number) => {
      const isNegative = v < 0;
      const rounded = Math.round(Math.abs(v) * 10 ** decimals) / 10 ** decimals;
      return `${isNegative ? '-' : ''}${symbol}${rounded}`;
    },
  };
};

const getCurrencyIntl = (currency: AvailableCurrencies) => {
  const region = currency === 'eur' ? 'fr-FR' : 'en-US';

  if (currency === 'btc' || currency === 'eth') {
    return cryptoCurrencyFormatter(currency);
  }

  return new Intl.NumberFormat(region, {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
};

const getSmallCurrencyIntl = (currency: AvailableCurrencies) => {
  const region = currency === 'eur' ? 'fr-FR' : 'en-US';

  if (currency === 'btc' || currency === 'eth') {
    return cryptoCurrencyFormatter(currency);
  }

  return new Intl.NumberFormat(region, {
    maximumFractionDigits: 5,
    style: 'currency',
    currency: currency.toUpperCase(),
  });
};

export const formatCurrency = (
  value: number | string,
  currency: AvailableCurrencies = 'usd'
) => {
  const v = typeof value === 'string' ? pFloat(value) : value;
  if (Math.abs(v) > 1) return getCurrencyIntl(currency).format(v);
  return getSmallCurrencyIntl(currency).format(v);
};

export const formatPercent = (value: number | string) => {
  const percent = abbreviateNumber(
    Math.round((typeof value === 'string' ? pFloat(value) : value) * 10e3) / 100
  );
  return `${percent}%`;
};

export function abbreviateNumber(n: number) {
  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return `${pFloat((n / 1e3).toFixed(1))}K`;
  if (n >= 1e6 && n < 1e9) return `${pFloat((n / 1e6).toFixed(1))}M`;
  if (n >= 1e9 && n < 1e12) return `${pFloat((n / 1e9).toFixed(1))}B`;
  if (n >= 1e12) return `${pFloat((n / 1e12).toFixed(1))}T`;
  return n;
}

export const hashFormatter = (hash: string) => {
  const firstPart = take(hash, 4);
  const lastPart = takeRight(hash, 4);
  return `${firstPart.join('')}...${lastPart.join('')}`;
};

export function formatNumber(
  value: number | string,
  dataKey: string,
  currency?: AvailableCurrencies
) {
  if (['usd', 'price'].some((v) => dataKey.toLowerCase().includes(v))) {
    return formatCurrency(value, currency);
  }

  if (dataKey === 'tvl') {
    return (value as number) > 1000
      ? abbreviateNumber(value as number)
      : formatCurrency(value, currency);
  }

  if (dataKey === 'apy') {
    return `${formatPercentage(Number(value) * 100)}%`;
  }

  return formatCrypto(value);
}

export function formatCrypto(value: number | string) {
  const v = typeof value === 'string' ? pFloat(value) : value;
  return Math.round(v * 10e5) / 10e5;
}
