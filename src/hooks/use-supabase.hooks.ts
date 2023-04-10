import { createClient } from '@supabase/supabase-js';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

import type { Database } from '../lib/database.types';

export const createSupabaseClient = ({
  url = 'https://vmmjsfatgzhdekdekchk.supabase.co',
  key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbWpzZmF0Z3poZGVrZGVrY2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA5NzYzMjQsImV4cCI6MTk5NjU1MjMyNH0.C4lzRrvOQS0PPduH_cfg3ThF-YDl_tc3h7I4AHRUFdY',
  accessToken,
}: {
  url?: string;
  key?: string;
  accessToken?: string;
}) => {
  return createClient<Database>(
    url,
    key,
    accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : {},
  );
};

export const useSupabase = () => {
  const { data: session } = useSession();
  console.log('fuck', session);
  const client = useMemo(
    () => createSupabaseClient({ accessToken: session?.accessToken }),
    [session],
  );

  return client;
};
