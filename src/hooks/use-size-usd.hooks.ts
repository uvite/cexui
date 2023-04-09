import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';

import { selectedAtom } from '../app-state';
import { floorStep } from '../utils/floor-step.utils';
import { pFloat } from '../utils/parse-float.utils';

const writableStringAtom = atom('');

export const useSizeUSD = ({
  sizeAtom,
  sizeUSDAtom,
}: {
  sizeAtom: typeof writableStringAtom;
  sizeUSDAtom: typeof writableStringAtom;
}) => {
  const { symbol, market, ticker } = useAtomValue(selectedAtom);
  const currSymbol = useRef(symbol);

  const [size, setSize] = useAtom(sizeAtom);
  const [sizeUSD, setSizeUSD] = useAtom(sizeUSDAtom);
  const [sizeUSDTouched, setSizeUSDTouched] = useState(false);

  const pAmt = market?.precision?.amount ?? 0;

  const displayedSizeUSD = sizeUSDTouched
    ? sizeUSD
    : Math.round(pFloat(size) * (ticker?.last ?? 0) * 100) / 100;

  const handleChangeSize = (value: string) => {
    setSize(value);
    setSizeUSD('');
    setSizeUSDTouched(false);
  };

  const handleChangeSizeUSD = (value: string) => {
    const rawSize = pFloat(value) / (ticker?.last ?? 0);
    const flooredSize = floorStep(rawSize, pAmt);
    setSize(flooredSize.toString());
    setSizeUSD(value);
    setSizeUSDTouched(true);
  };

  // Reset size and sizeUSD when symbol changes
  // ------------------------------------------
  useEffect(() => {
    if (currSymbol.current !== symbol) {
      currSymbol.current = symbol;
      setSize('');
      setSizeUSD('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  // Reset size and sizeUSD when component unmounts
  // ----------------------------------------------
  useEffect(() => {
    return () => {
      setSize('');
      setSizeUSD('');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    size,
    sizeUSD: displayedSizeUSD ? `${displayedSizeUSD}` : '',
    handleChangeSize,
    handleChangeSizeUSD,
  };
};
