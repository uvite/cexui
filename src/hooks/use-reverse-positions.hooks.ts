import { useCallback } from 'react';
import type { Position } from 'safe-cex/dist/types';

import { useReducePositions } from './use-reduce-positions.hooks';

export const useReversePositions = () => {
  const reducePositions = useReducePositions();
  const reversePositions = useCallback(
    ({ positions }: { positions: Position[] }) => {
      const promises = positions.flatMap((position) => [
        reducePositions({
          positions: [position],
          factor: 1,
          hedge: true,
          forceMarket: true,
        }),
        reducePositions({
          positions: [position],
          factor: 1,
          forceMarket: true,
        }),
      ]);

      return Promise.all(promises);
    },
    [reducePositions]
  );

  return reversePositions;
};
