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
          <div className="bg-dark-bg-2 rounded-sm text-dark-text-white shadow-lg ring-1 ring-white/10 ring-inset">
            <div className="h-[50px] border-b border-b-sky-300 py-2 px-3">
              {title}
            </div>
          </div>
          <div className="bg-dark-bg-2 text-dark-text-white h-[calc(100%-50px)]">
            {children}
          </div>
        </NewWindow>
      )}
      <div className="w-full h-full bg-dark-bg-2 rounded-sm text-dark-text-white shadow-lg ring-1 ring-white/10 ring-inset overflow-hidden">
        <div
          className={cx(
            'h-[50px] w-full border-b border-b-sky-300 py-2 px-3 draggable flex items-center',
            { 'cursor-move': movable }
          )}
        >
          <div className="flex-1">
            <div className="flex items-center">
              <div className="flex-1 select-none">{title}</div>
              {newWindow && (
                <div
                  className="border-2 border-dark-border-gray-2 px-2 py-0.5 rounded-sm cursor-pointer ml-2"
                  onClick={() => setIsWindowOpen(true)}
                >
                  <RxOpenInNewWindow />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full h-[calc(100%-50px)] overflow-auto relative">
          {children}
        </div>
      </div>
    </>
  );
};
