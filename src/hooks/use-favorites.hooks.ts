import { atom, useAtomValue, useSetAtom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { useCallback } from 'react';

import { appSettingsAtom } from '../app-settings';
import { selectedSymbolAtom } from '../atoms/trade.atoms';

export const favoriteSymbolsAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('favorites')
);

export const toggleFavAtom = atom(null, (get, set, symbol: string) => {
  const prev = get(favoriteSymbolsAtom);
  const isFav = prev.includes(symbol);
  const merged = isFav ? prev.filter((p) => p !== symbol) : [...prev, symbol];
  set(favoriteSymbolsAtom, merged);
});

export const toggleSelectedSymbolAsFavorite = atom(null, (get, set) => {
  const prev = get(favoriteSymbolsAtom);
  const symbol = get(selectedSymbolAtom);
  const isFav = prev.includes(symbol);
  const merged = isFav ? prev.filter((p) => p !== symbol) : [...prev, symbol];
  set(favoriteSymbolsAtom, merged);
});

export const useFavorites = () => {
  const favorites = useAtomValue(favoriteSymbolsAtom);
  const toggleFav = useSetAtom(toggleFavAtom);

  const isFav = useCallback(
    (symbol: string) => favorites.includes(symbol),
    [favorites]
  );

  return { favorites, toggleFav, isFav };
};
