import { atom, useAtomValue, useSetAtom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { pick } from 'lodash';

import { appSettingsAtom, defaultSettings } from '../app-settings';
import { TradeComponentType } from '../app.types';
import {
  togglePreviewAtom,
  privacyAtom,
  toggleSoundAtom,
} from '../atoms/app.atoms';
import { selectedTradeAtom } from '../atoms/trade.atoms';

import {
  selectFirstNewsAtom,
  selectNextNewsAtom,
  selectPreviousNewsAtom,
} from './trade/use-news-trade.hooks';
import { toggleSelectedSymbolAsFavorite } from './use-favorites.hooks';
import { useKeyBindings } from './use-keybindings.hooks';
import { useIsModalOpen, useOpenModal } from './use-modal.hooks';
import {
  setNextPositionAtom,
  setPreviousPositionAtom,
} from './use-positions.hooks';
import { cycleTimeframeAtom } from './use-timeframe.hooks';

const defaultShortcuts = defaultSettings.shortcuts;
export const shortcutsBaseAtom = focusAtom(appSettingsAtom, (o) =>
  o.prop('shortcuts')
);

export const shortcutsAtom = atom(
  (get) => {
    const shortcuts = get(shortcutsBaseAtom);
    const missing = Object.keys(defaultShortcuts).filter(
      (key) => !(key in shortcuts)
    );

    return {
      ...shortcuts,
      ...pick(defaultShortcuts, missing),
    };
  },
  (get, set, action: Partial<typeof defaultShortcuts>) => {
    const prev = get(shortcutsBaseAtom);
    set(shortcutsBaseAtom, { ...prev, ...action });
  }
);

export const useAppShortcuts = () => {
  const shortcuts = useAtomValue(shortcutsAtom);

  const isModalOpen = useIsModalOpen();
  const openModal = useOpenModal();

  const setNextPosition = useSetAtom(setNextPositionAtom);
  const setPreviousPosition = useSetAtom(setPreviousPositionAtom);
  const cycleTimeframe = useSetAtom(cycleTimeframeAtom);
  const toggleFavorite = useSetAtom(toggleSelectedSymbolAsFavorite);
  const togglePreview = useSetAtom(togglePreviewAtom);
  const setPrivacy = useSetAtom(privacyAtom);
  const toggleSound = useSetAtom(toggleSoundAtom);
  const setSelectedTradeInstrument = useSetAtom(selectedTradeAtom);
  const selectPreviousNews = useSetAtom(selectPreviousNewsAtom);
  const selectNextNews = useSetAtom(selectNextNewsAtom);
  const selectFirstNews = useSetAtom(selectFirstNewsAtom);

  const shortcutsEnabled = !isModalOpen;

  useKeyBindings(
    [
      {
        keys: shortcuts.nextPosition,
        onEvent: (event) => {
          event.preventDefault();
          setNextPosition();
        },
      },
      {
        keys: shortcuts.previousPosition,
        onEvent: (event) => {
          event.preventDefault();
          setPreviousPosition();
        },
      },
      {
        keys: shortcuts.cycleTimeframes,
        onEvent: (event) => {
          event.preventDefault();
          cycleTimeframe();
        },
      },
      {
        keys: shortcuts.searchFocus,
        onEvent: (event) => {
          const $input =
            document.querySelector<HTMLInputElement>('#tickers-search');

          if ($input) {
            event.preventDefault();
            $input.focus();
          }
        },
      },
      {
        keys: shortcuts.toggleFavorite,
        onEvent: (event) => {
          event.preventDefault();
          toggleFavorite();
        },
      },
      {
        keys: shortcuts.togglePreview,
        onEvent: (event) => {
          event.preventDefault();
          togglePreview();
        },
      },
      {
        keys: shortcuts.toggleSettings,
        onEvent: (event) => {
          event.preventDefault();
          openModal();
        },
      },
      {
        keys: shortcuts.togglePrivacy,
        onEvent: (event) => {
          event.preventDefault();
          setPrivacy((prev) => !prev);
        },
      },
      {
        keys: shortcuts.toggleSound,
        onEvent: (event) => {
          event.preventDefault();
          toggleSound();
        },
      },
      {
        keys: shortcuts.scaleByRiskFocus,
        onEvent: (event) => {
          event.preventDefault();
          setSelectedTradeInstrument(TradeComponentType.ScaleInRisk);
        },
      },
      {
        keys: shortcuts.scaleBySizeFocus,
        onEvent: (event) => {
          event.preventDefault();
          setSelectedTradeInstrument(TradeComponentType.ScaleInSize);
        },
      },
      {
        keys: shortcuts.allInOneFocus,
        onEvent: (event) => {
          event.preventDefault();
          setSelectedTradeInstrument(TradeComponentType.AllInOne);
        },
      },
      {
        keys: shortcuts.simpleTrade,
        onEvent: (event) => {
          event.preventDefault();
          setSelectedTradeInstrument(TradeComponentType.Simple);
        },
      },
      {
        keys: shortcuts.twapTrade,
        onEvent: (event) => {
          event.preventDefault();
          setSelectedTradeInstrument(TradeComponentType.Twap);
        },
      },
      {
        keys: shortcuts.chaseTrade,
        onEvent: (event) => {
          event.preventDefault();
          setSelectedTradeInstrument(TradeComponentType.Chase);
        },
      },
      {
        keys: shortcuts.nextNews,
        onEvent: (event) => {
          event.preventDefault();
          selectNextNews();
        },
      },
      {
        keys: shortcuts.previousNews,
        onEvent: (event) => {
          event.preventDefault();
          selectPreviousNews();
        },
      },
      {
        keys: shortcuts.selectFirstNews,
        onEvent: (event) => {
          event.preventDefault();
          selectFirstNews();
        },
      },
    ],
    shortcutsEnabled
  );
};
