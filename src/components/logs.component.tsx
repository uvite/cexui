import cx from 'clsx';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import React from 'react';
import { Virtuoso } from 'react-virtuoso';

import type { Log } from '../hooks/use-logs.hooks';
import { LogSeverity, logsAtom } from '../hooks/use-logs.hooks';

import { GridBlockComponent } from './ui/grid-block.component';

const LogMessageComponent = ({ log }: { log: Log }) => {
  const topic = /^(\[.*?\])/.exec(log.message)?.[1];
  const message = log.message.replace(topic || '', '').trim();

  return (
    <div key={log.id} className="flex font-mono text-[13px]">
      <span className="text-dark-text-white/50 shrink-0">
        [{dayjs(log.timestamp).format('hh:mm:ss.SSS A')}]
      </span>
      {topic && (
        <span className="text-dark-text-white/30 ml-2 shrink-0">
          {topic.replace('[', '').replace(']', '')}
        </span>
      )}
      <span
        className={cx('ml-2', {
          'text-dark-text-white/90': log.type === LogSeverity.Info,
          'text-red-500': log.type === LogSeverity.Error,
          'text-orange-500': log.type === LogSeverity.Warning,
        })}
      >
        {message}
      </span>
    </div>
  );
};
export const LogsComponent = () => {
  const logs = useAtomValue(logsAtom);

  return (
    <GridBlockComponent title={<div className="font-bold">日志</div>}>
      <div className="bg-dark-bg/70 h-full w-full p-2">
        <Virtuoso
          data={logs}
          totalCount={logs.length}
          className="no-scrollbar"
          increaseViewportBy={{ top: 200, bottom: 200 }}
          itemContent={(_index, item) => <LogMessageComponent log={item} />}
        />
      </div>
    </GridBlockComponent>
  );
};
