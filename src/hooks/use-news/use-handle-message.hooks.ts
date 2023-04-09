import emojiStrip from 'emoji-strip';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { v4 } from 'uuid';

import {
  isMutedAtom,
  messageHistoryAtom,
  setMessageHistoryAtom,
} from '../../atoms/app.atoms';
import { selectedSymbolAtom } from '../../atoms/trade.atoms';
import { playNewsAlertSound } from '../../sounds';
import { formatNews } from '../../utils/format-news.utils';
import { matchTickersAtom } from '../../utils/ticker-match/ticker-match.atoms';
import {
  newsText2SpeechAtom,
  newsText2SpeechPlaybackSpeedAtom,
  newsBlocklistAtom,
  selectedNewsAtom,
  newsAutoSelectTickerAtom,
} from '../trade/use-news-trade.hooks';
import { logsAtom } from '../use-logs.hooks';

import { isBlocked } from './news.utils';
import type { News } from './use-news.types';

export const useHandleMessage = () => {
  const isMuted = useAtomValue(isMutedAtom);
  const text2Speech = useAtomValue(newsText2SpeechAtom);
  const playbackSpeed = useAtomValue(newsText2SpeechPlaybackSpeedAtom);
  const blocklist = useAtomValue(newsBlocklistAtom);
  const matchTickers = useAtomValue(matchTickersAtom);
  const messageHistory = useAtomValue(messageHistoryAtom);
  const setMessageHistory = useSetAtom(setMessageHistoryAtom);
  const setSelectedNews = useSetAtom(selectedNewsAtom);
  const setSelectedSymbol = useSetAtom(selectedSymbolAtom);
  const autoSelectTicker = useAtomValue(newsAutoSelectTickerAtom);
  const log = useSetAtom(logsAtom);

  const handleMessage = useCallback(
    (message: News) => {
      if (isBlocked(blocklist, message)) {
        log('[NEWSMAKER] News ommited due to blocklist');
        return;
      }

      const symbols = matchTickers(message);
      const news = formatNews(message);

      const exists = messageHistory.some(
        (n) => n.news.content === news.content && n.news.author === news.author
      );

      // play sound if news is new and not muted in settings
      if (!exists && !isMuted && news.content.length > 2) {
        playNewsAlertSound();

        if (text2Speech && 'speechSynthesis' in window) {
          const msg = new SpeechSynthesisUtterance(emojiStrip(news.content));

          msg.rate = playbackSpeed;
          window.speechSynthesis.speak(msg);
        }
      }

      if (!exists) {
        // add new news to history list
        const id = 'id' in message ? message.id : v4();
        const obj = { id, news, symbols, receivedAt: Date.now() };

        setMessageHistory([obj]);

        // auto select first ticker if option is enabled
        // this will switch chart on news
        if (autoSelectTicker && symbols[0]) {
          setSelectedSymbol(symbols[0]);
          setSelectedNews(obj.id);
        }
      }
    },
    [
      autoSelectTicker,
      blocklist,
      isMuted,
      log,
      matchTickers,
      messageHistory,
      playbackSpeed,
      setMessageHistory,
      setSelectedNews,
      setSelectedSymbol,
      text2Speech,
    ]
  );

  return handleMessage;
};
