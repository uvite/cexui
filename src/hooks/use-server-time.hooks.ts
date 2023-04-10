import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import useSWR from 'swr';

dayjs.extend(utc);

export const useServerTime = () => {
  const { data } = useSWR(
    'serverTime',
    async () => {
      const { time: server } = await fetch('https://worldtimeapi.org/api/timezone/etc/utc').then(
        (res) => res.json(),
      );

      return {
        server: dayjs.utc(server),
        client: dayjs().utc(),
      };
    },
    { refreshInterval: 5000 },
  );

  return data;
};
