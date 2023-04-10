import { useAtom } from 'jotai';
import { debounce, merge } from 'lodash';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { AppSettings } from '../app-settings';
import { defaultSettings, appSettingsAtom } from '../app-settings';

import { useSupabase } from './use-supabase.hooks';

export const useSettingsSync = () => {
  const [hasFetched, setHasFetched] = useState(false);
  const loading = useRef(false);

  const supabase = useSupabase();
  const { data: session } = useSession();

  const [settings, setSettings] = useAtom(appSettingsAtom);

  const debounced = useMemo(
    () =>
      debounce(async (userId: string, data: Record<string, any>) => {
        await supabase.from('users_settings').upsert({
          user_id: userId,
          settings: data,
        });
      }, 300),
    [supabase],
  );

  const updateSettings = () => {
    if (session && hasFetched && !loading.current) {
      debounced(session.user.id, settings);
    }
  };

  const fetchSettings = async () => {
    if (session && !hasFetched && !loading.current) {
      loading.current = true;

      const { data } = await supabase.from('users_settings').select();
      const [row] = data || [];

      if (row?.settings) {
        const _settings = row.settings as unknown as AppSettings;
        setSettings(merge({}, defaultSettings, _settings));
      }

      loading.current = false;
      setHasFetched(true);
    }
  };

  useEffect(() => {
    updateSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loaded: hasFetched,
    settings,
  };
};
