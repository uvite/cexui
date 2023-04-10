import { useHydrateAtoms } from 'jotai/utils';
import type { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { WebPageJsonLd } from 'next-seo';
import React from 'react';
import { v4 } from 'uuid';

import pkg from '../../package.json';
import { AppComponent } from '../components/app.component';
import { LogSeverity, logsStorageAtom } from '../hooks/use-logs.hooks';
import { createSupabaseClient } from '../hooks/use-supabase.hooks';
import { seoConfig } from '../seo-config';
import type {
  TickersWordsCommon,
  TickersWordsMapping,
} from '../utils/ticker-match/ticker-match.atoms';
import {
  tickersWordsCommonAtom,
  tickersWordsMappingAtom,
} from '../utils/ticker-match/ticker-match.atoms';

import { authOptions } from './api/auth/[...nextauth]';

const IndexPage = ({
  tickersWordsCommon,
  tickersWordsMapping,
}: {
  tickersWordsCommon: TickersWordsCommon;
  tickersWordsMapping: TickersWordsMapping;
}) => {
  useHydrateAtoms([
    [tickersWordsCommonAtom, tickersWordsCommon],
    [tickersWordsMappingAtom, tickersWordsMapping],
    [
      logsStorageAtom,
      [
        {
          id: v4(),
          timestamp: Date.now(),
          message: `tuleep.trade v${pkg.version} env:${process.env.STAGE}`,
          type: LogSeverity.Info,
        },
      ],
    ],
  ]);

  return (
    <>
      <WebPageJsonLd
        id="https://tuleep.trade"
        description={seoConfig.description}
        lastReviewed="2023-02-28T18:45:00.000Z"
        reviewedBy={{ name: 'tuleep.trade', type: 'Organization' }}
      />
      <AppComponent />
    </>
  );
};

export async function getServerSideProps({ res, req }: GetServerSidePropsContext) {
  const session = {
    accessToken: '123123',
    event: 'session',
    data: { trigger: 'getSession' },
    timestamp: 1680976484,
  };
  //await getServerSession(req, res, authOptions);
  const supabase = createSupabaseClient({ accessToken: session?.accessToken });

  const [{ data: tickersWordsMapping }, { data: tickersWordsCommon }] = await Promise.all([
    supabase.from('tickers_words_mapping').select('word, tickers'),
    supabase.from('tickers_words_common').select('word'),
  ]);

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');

  return {
    props: {
      tickersWordsCommon: tickersWordsCommon?.map((item) => item.word) || [],
      tickersWordsMapping: Object.fromEntries(
        tickersWordsMapping?.map((item) => [item.word, item.tickers]) || [],
      ),
    },
  };
}

export default IndexPage;
