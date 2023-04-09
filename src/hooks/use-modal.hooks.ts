import { useAtomValue } from 'jotai';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { selectedAccountAtom } from './use-accounts.hooks';

export const useIsModalOpen = () => {
  const router = useRouter();
  const account = useAtomValue(selectedAccountAtom);
  const { data: session } = useSession();

  return Boolean(
    (session && router.query.modal === 'settings') || (session && !account)
  );
};

export const useOpenModal = () => {
  const router = useRouter();

  const [path] = router.asPath.split('?');
  const nextURL = `${path}?modal=settings&tab=general`;

  return () => router.push(nextURL, nextURL, { shallow: true });
};
