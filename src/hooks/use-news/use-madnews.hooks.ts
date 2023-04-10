import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import useSWR from 'swr';
import { v4 } from 'uuid';

import { setMessageHistoryAtom } from '../../atoms/app.atoms';
import { formatNews } from '../../utils/format-news.utils';
import { matchTickersAtom } from '../../utils/ticker-match/ticker-match.atoms';
import { newsBlocklistAtom, treeNewsKeyAtom } from '../trade/use-news-trade.hooks';
import { selectedAccountAtom } from '../use-accounts.hooks';
import { logsAtom, LogSeverity } from '../use-logs.hooks';
import { useSupabase } from '../use-supabase.hooks';

import { isBlocked } from './news.utils';
import { useHandleMessage } from './use-handle-message.hooks';
import type { News, NewsWithSymbols } from './use-news.types';

const useMadnewsHistory = () => {
  const [loaded, setLoaded] = useState(false);

  const supabase = useSupabase();

  const blocklist = useAtomValue(newsBlocklistAtom);
  const account = useAtomValue(selectedAccountAtom);

  const matchTickers = useAtomValue(matchTickersAtom);
  const setMessageHistory = useSetAtom(setMessageHistoryAtom);

  useSWR(
    `madnews-history/${account?.exchange}_${account?.testnet}`,
    async () => {
      const { data } = await supabase
        .from('madnews')
        .select()
        .order('created_at', { ascending: false })
        .limit(50);

      return data?.map((d) => d.message as unknown as News) || [];
    },
    {
      isPaused: () => !account || loaded,
      onSuccess: (messages) => {
        const news = messages.reduce<NewsWithSymbols[]>((acc, n: News) => {
          if (isBlocked(blocklist, n)) return acc;

          if (n.title) {
            const formatted = formatNews(n);
            const symbols = matchTickers(n);
            return [...acc, { id: v4(), news: formatted, symbols }];
          }

          return acc;
        }, []);

        setMessageHistory(news);
        setLoaded(true);
      },
    },
  );

  return loaded;
};

const useMadnewsWebsocket = () => {
  const log = useSetAtom(logsAtom);
  const apiKey = useAtomValue(treeNewsKeyAtom);
  const handleMessage = useHandleMessage();

  const { lastMessage, sendMessage, readyState } = useWebSocket(`wss://news.treeofalpha.com/ws`, {
    shouldReconnect: () => true,
    onMessage: () => log('[TREENEWS] Received new message'),
    onOpen: () => log('[TREENEWS] Connected to data stream'),
    onClose: () => {
      log('[TREENEWS] Disconnected from data stream', LogSeverity.Warning);
    },
  });

  useEffect(() => {
    if (readyState === WebSocket.OPEN && apiKey && apiKey.length === 64) {
      sendMessage(`login ${apiKey}`);
    }
  }, [readyState, sendMessage, apiKey]);

  useEffect(() => {
    if (lastMessage !== null) {
      const message = JSON.parse(lastMessage.data);

      if ('_id' in message && 'title' in message && 'time' in message) {
        handleMessage(message);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage]);
};

export const useMadnews = () => {
  useMadnewsWebsocket();
  const loaded = useMadnewsHistory();
  return loaded;
};
