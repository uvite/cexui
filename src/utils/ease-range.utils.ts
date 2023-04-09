import { easePolyOut, easePolyIn } from 'd3-ease';

const normalize = (min: number, max: number) => {
  const delta = max - min;

  return function (val: number) {
    return (val - min) / delta;
  };
};

const unNormalize = (min: number, max: number) => {
  const delta = max - min;

  return function (val: number) {
    return val * delta + min;
  };
};

export const easeRange = (range: number[], easeRatio: number) => {
  const min = easeRatio > 2 ? 2 : 2;
  const max = easeRatio > 2 ? 3 : 1;

  const ratio = ((easeRatio - min) * (3 - 1)) / (max - min) + 1;
  const ease =
    easeRatio > 2 ? easePolyOut.exponent(ratio) : easePolyIn.exponent(ratio);

  const rMin = Math.min(...range);
  const rMax = Math.max(...range);

  return range
    .map(normalize(rMin, rMax))
    .map((val) => ease(val))
    .map(unNormalize(rMin, rMax));
};
