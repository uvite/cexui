import { abbreviateNumber } from './formatter.utils';

function calcPercent(now: number, start: number) {
  // decrease
  if (now < start) {
    const decrease = start - now;
    const percent = (decrease / start) * 100;
    return percent;
  }

  const increase = now - start;
  const percent = (increase / start) * 100;
  return percent;
}

export function toPercentage({ now, start }: { now: number; start: number }) {
  if (now === start) return `0%`;
  return formatPercentage(Math.abs(calcPercent(now, start)));
}

export function formatPercentage(percent: number) {
  let _percent = percent;

  if (_percent > 10e8) return '100%';

  _percent =
    _percent < 0.01
      ? Math.round(_percent * 10e2) / 10e2
      : Math.round(_percent * 100) / 100;

  let _formatted = `${abbreviateNumber(_percent)}`;
  _formatted = `${_percent.toFixed(2)}%`;

  return _formatted;
}
