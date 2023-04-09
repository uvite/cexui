export const easeRatioToPercent = (ratio: number) => {
  let _ratio = ratio;

  if (_ratio === 2) _ratio = 0;
  if (_ratio > 2) _ratio = (ratio - 2) * 100;
  if (_ratio < 2) _ratio = (2 - ratio) * -100;

  _ratio = Math.round(_ratio * 100) / 100;

  return `${_ratio > 0 ? '+' : ''}${Math.trunc(_ratio)}%`;
};
