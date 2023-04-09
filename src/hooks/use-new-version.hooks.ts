import { useRef, useState } from 'react';
import useSWR from 'swr';

export const useNewVersion = () => {
  const firstVersion = useRef('');
  const [hasNewVersion, setHasNewVersion] = useState(false);

  useSWR('/api/version', (url) => fetch(url).then((res) => res.json()), {
    refreshInterval: 10_000,
    onSuccess: ({ version }) => {
      if (!firstVersion.current) {
        firstVersion.current = version;
      } else {
        setHasNewVersion(version !== firstVersion.current);
      }
    },
  });

  return hasNewVersion;
};
