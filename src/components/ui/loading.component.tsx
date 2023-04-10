import React from 'react';

export const LoadingComponent = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <img alt="loading" src="/loading-bubbles.svg" width={64} height={64} className="opacity-50" />
    </div>
  );
};
