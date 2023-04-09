import { signIn } from 'next-auth/react';

import { EventName, useAnalytics } from './use-analytics.hooks';

type SignInLabel = 'home__how_it_works' | 'home__navbar';

export const useSignIn = () => {
  const track = useAnalytics();

  return (label: SignInLabel) =>
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault();
      track(EventName.SignIn, { label });
      signIn('auth0');
    };
};
