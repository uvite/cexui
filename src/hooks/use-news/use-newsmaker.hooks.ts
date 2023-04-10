import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { setMessageHistoryAtom } from '../../atoms/app.atoms';
import { formatNews } from '../../utils/format-news.utils';
import { matchTickersAtom } from '../../utils/ticker-match/ticker-match.atoms';
import { newsBlocklistAtom } from '../trade/use-news-trade.hooks';
import { selectedAccountAtom } from '../use-accounts.hooks';
import { useSupabase } from '../use-supabase.hooks';

import { isBlocked } from './news.utils';
import { useHandleMessage } from './use-handle-message.hooks';
import type { NewsWithSymbols, TGNews } from './use-news.types';

const transformMessage = (record: Record<string, any>) => {
  return {
    id: record.id.toString(),
    title: 'Newsmaker.Pro',
    source: 'Newsmaker.Pro',
    body: (record.message as any).message,
    time: (record.message as any).time * 1000,
    link: 'https://t.me/s/nwsmkr',
  };
};

const useNewsmakerHistory = () => {
  const [loaded, setLoaded] = useState(false);

  const supabase = useSupabase();

  const account = useAtomValue(selectedAccountAtom);
  const blocklist = useAtomValue(newsBlocklistAtom);

  const matchTickers = useAtomValue(matchTickersAtom);
  const setMessageHistory = useSetAtom(setMessageHistoryAtom);

  useSWR(
    `newsmaker/${account?.exchange}_${account?.testnet}`,
    async () => {
      const { data } = await supabase
        .from('newsmaker')
        .select()
        .order('created_at', { ascending: false })
        .limit(50);

      return data || [];
    },
    {
      isPaused: () => !account || loaded,
      onSuccess: (data) => {
        const asMadnewsFormat: TGNews[] = data
          .filter((d) => d.message && (d.message as any).message)
          .map((d) => transformMessage(d));

        const news = asMadnewsFormat.reduce<NewsWithSymbols[]>((acc, n) => {
          if (isBlocked(blocklist, n)) return acc;

          if (n.title) {
            const formatted = formatNews(n);
            const symbols = matchTickers(n);
            return [...acc, { id: n.id, news: formatted, symbols }];
          }

          return acc;
        }, []);

        setMessageHistory(news);
        setLoaded(true);
      },
    },
  );
};

const useNewsmakerWebsocket = () => {
  const supabase = useSupabase();
  const handleMessage = useHandleMessage();
  const [lastMessage, setLastMessage] = useState<TGNews | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel('newsmaker-live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'newsmaker',
        },
        ({ new: data }) => {
          setLastMessage(transformMessage(data));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    if (lastMessage !== null) {
      handleMessage(lastMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage]);
};

export const useNewsmaker = () => {
  useNewsmakerWebsocket();
  const loaded = useNewsmakerHistory();
  return loaded;
};
