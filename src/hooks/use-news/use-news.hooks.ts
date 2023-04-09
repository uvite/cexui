import { useAtom, useAtomValue } from 'jotai';
import { useRef, useEffect } from 'react';

import { isMutedAtom, messageHistoryAtom } from '../../atoms/app.atoms';
import { newsText2SpeechAtom } from '../trade/use-news-trade.hooks';
import { selectedAccountAtom } from '../use-accounts.hooks';

export const useNews = () => {
  const account = useAtomValue(selectedAccountAtom);
  const currentExchange = useRef(`${account?.exchange}_${account?.testnet}`);

  const [messages, setMessages] = useAtom(messageHistoryAtom);
  const isMuted = useAtomValue(isMutedAtom);
  const text2Speech = useAtomValue(newsText2SpeechAtom);

  // reset history on exchange change
  // we might have different symbols / price on different exchanges
  useEffect(() => {
    if (
      currentExchange.current !== `${account?.exchange}_${account?.testnet}`
    ) {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  // cancel on-going text2speech if muted or disabled
  useEffect(() => {
    if ((isMuted || !text2Speech) && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isMuted, text2Speech]);

  return { messages };
};
