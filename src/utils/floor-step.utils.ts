import BigNumber from 'bignumber.js';

export const floorStep = (value: number, step: number | string) => {
  return new BigNumber(value)
    .dividedBy(step)
    .integerValue(BigNumber.ROUND_FLOOR)
    .multipliedBy(step)
    .toNumber();
};
