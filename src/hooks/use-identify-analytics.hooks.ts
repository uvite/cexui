import { useJitsu } from '@jitsu/nextjs';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

export const useIdentifyAnalytics = () => {
  const hasIdentified = useRef(false);

  const { id } = useJitsu();
  const { data: session } = useSession();

  useEffect(() => {
    if (session && !hasIdentified.current) {
      hasIdentified.current = true;
      id({ id: session.user.id, email: session.user.email });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);
};
