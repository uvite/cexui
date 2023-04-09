export const toUSD = (val: number | string) =>
  val?.toLocaleString('en-US', {
    currency: 'USD',
    style: 'currency',
  });
