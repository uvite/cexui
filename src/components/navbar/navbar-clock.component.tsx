import cx from 'clsx';
import dayjs from 'dayjs';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';

import { utcToggleAtom } from '../../atoms/app.atoms';
import { useServerTime } from '../../hooks/use-server-time.hooks';

export const NavbarClockComponent = () => {
  const data = useServerTime();
  const [displayed, setDisplayed] = useState(data?.server);
  const [utc, toggleUTC] = useAtom(utcToggleAtom);

  useEffect(() => {
    let loop = true;

    if (data) {
      const start = dayjs.utc();

      const animate = () => {
        const now = dayjs.utc();
        const diff = now.diff(start, 'millisecond');
        const server = data.server.add(diff, 'millisecond');

        setDisplayed(utc ? server : server.local());

        if (loop && !window.location.search.includes('?modal=settings')) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }

    return () => {
      loop = false;
    };
  }, [data, utc]);

  return (
    <div className="ml-2">
      <span className="border-2 border-dark-border-gray rounded-md px-2 py-2">
        <span
          className="font-mono text-sm font-bold cursor-pointer select-none"
          onClick={toggleUTC}
        >
          {displayed?.format('hh:mm:ss.SSS A')}{' '}
          <span className={cx({ 'opacity-10': !utc })}>(UTC)</span>
        </span>
      </span>
    </div>
  );
};
