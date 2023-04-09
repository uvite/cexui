import React from 'react';

export const NavbarIndicator = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => {
  return (
    <div
      className="border-2 border-purple-500 rounded-md px-2 py-2 ml-2 text-sm cursor-pointer animate-pulse-slow"
      onClick={onClick}
    >
      <strong>{label}</strong>
    </div>
  );
};
