export const afterDecimal = (num: number | string) => {
  if (Number.isInteger(num)) return 0;
  return num?.toString()?.split?.('.')?.[1]?.length || 1;
};
