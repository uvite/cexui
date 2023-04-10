import React from 'react';

export const NavbarIndicator = ({ label, onClick }: { label: string; onClick: () => void }) => {
  return (
    <div
      className="animate-pulse-slow ml-2 cursor-pointer rounded-md border-2 border-purple-500 px-2 py-2 text-sm"
      onClick={onClick}
    >
      <strong>{label}</strong>
    </div>
  );
};
