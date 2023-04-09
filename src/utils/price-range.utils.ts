export const generatePriceRange = ({
  from,
  to,
  nbOrders,
}: {
  from: number;
  to: number;
  nbOrders: number;
}) => {
  const rangeStep = (Math.max(from, to) - Math.min(from, to)) / (nbOrders - 1);
  const priceRange = [];

  if (from > to) {
    for (let i = 0; i < nbOrders; i++) {
      priceRange.push(from - rangeStep * i);
    }
  } else {
    for (let i = 0; i < nbOrders; i++) {
      priceRange.push(from + rangeStep * i);
    }
  }

  return priceRange;
};
