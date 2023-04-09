import { useSession } from 'next-auth/react';
import React, { useEffect, useRef } from 'react';

import { errorToast } from '../notifications/error.toast';

const registerServiceWorker = () => {
  return navigator.serviceWorker.register('./worker.js', {
    scope: '/',
  });
};

const getServiceWorker = (register: ServiceWorkerRegistration) => {
  return register.installing || register.waiting || register.active;
};

const subscribePush = async (
  register: ServiceWorkerRegistration,
  userId: string
) => {
  try {
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.WB_PUBLIC_KEY as string,
    });

    await fetch('https://stemm.tuleep.trade/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subscription }),
    });
  } catch (err: any) {
    if (
      err?.message?.includes('Registration failed - push service error') &&
      (navigator as any).brave &&
      (await (navigator as any).brave.isBrave())
    ) {
      errorToast(
        <div className="w-full px-1">
          For Brave push notifications, you need to enable "Use Google services
          for push messaging" in Brave privacy settings.
        </div>,
        { autoClose: false, type: 'warning' }
      );
    }

    // only show error if it's not permission denied
    if (!err?.message?.includes('denied')) {
      errorToast(err.message);
    }
  }
};

export const usePushNotifications = () => {
  const requested = useRef(false);
  const { data: session } = useSession();

  const subscribe = async (userId: string) => {
    const register = await registerServiceWorker();
    const serviceWorker = getServiceWorker(register);

    if (serviceWorker) {
      if (serviceWorker.state === 'activated') {
        await subscribePush(register, userId);
      }

      serviceWorker.addEventListener('statechange', async (event: any) => {
        if (event?.target?.state === 'activated') {
          await subscribePush(register, userId);
        }
      });
    }
  };

  useEffect(() => {
    if (!requested.current && session?.user?.id) {
      requested.current = true;
      subscribe(session.user.id);
    }
  }, [session]);
};
