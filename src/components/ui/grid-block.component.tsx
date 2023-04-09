import cx from 'clsx';
import React, { useState } from 'react';
import { RxOpenInNewWindow } from 'react-icons/rx';
import NewWindow from 'react-new-window';

export const GridBlockComponent = ({
  children,
  title,
  newWindow,
  movable = true,
  onNewWindowOpen,
  onNewWindowClose,
}: {
  title: React.ReactNode;
  newWindow?: string;
  children?: React.ReactNode;
  movable?: boolean;
  onNewWindowOpen?: (window: Window) => void;
  onNewWindowClose?: () => void;
}) => {
  const [isWindowOpen, setIsWindowOpen] = useState(false);

  return (
    <>
      {newWindow && isWindowOpen && (
        <NewWindow
          title={newWindow}
          name={newWindow}
          copyStyles={true}
          onUnload={() => {
            setIsWindowOpen(false);
            onNewWindowClose?.();
          }}
          onOpen={onNewWindowOpen}
        >
          <div className="bg-dark-bg-2 text-dark-text-white rounded-sm shadow-lg ring-1 ring-inset ring-white/10">
            <div className="h-[50px] border-b border-b-sky-300 px-3 py-2">{title}</div>
          </div>
          <div className="bg-dark-bg-2 text-dark-text-white h-[calc(100%-50px)]">{children}</div>
        </NewWindow>
      )}
      <div className="bg-dark-bg-2 text-dark-text-white h-full w-full overflow-hidden rounded-sm shadow-lg ring-1 ring-inset ring-white/10">
        <div
          className={cx(
            'draggable flex h-[50px] w-full items-center border-b border-b-sky-300 px-3 py-2',
            { 'cursor-move': movable },
          )}
        >
          <div className="flex-1">
            <div className="flex items-center">
              <div className="flex-1 select-none">{title}</div>
              {newWindow && (
                <div
                  className="border-dark-border-gray-2 ml-2 cursor-pointer rounded-sm border-2 px-2 py-0.5"
                  onClick={() => setIsWindowOpen(true)}
                >
                  <RxOpenInNewWindow />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative h-[calc(100%-50px)] w-full overflow-auto">{children}</div>
      </div>
    </>
  );
};
