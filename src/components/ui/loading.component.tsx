import React from 'react';

export const LoadingComponent = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <img
        alt="loading"
        src="/loading-bubbles.svg"
        width={64}
        height={64}
        className="opacity-50"
      />
    </div>
  );
};
