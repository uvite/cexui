import React from 'react';
import { TbRadioactive } from 'react-icons/tb';

import { useNuke } from '../../hooks/use-nuke.hooks';

export const NavbarNukeButton = () => {
  const nuke = useNuke();

  return (
    <div
      className="flex flex-col items-center justify-center border rounded-sm w-14 cursor-pointer select-none last:mr-0 border-dark-border-gray-2 text-dark-border-gray-2 hover:border-red-500 hover:text-red-500"
      onClick={nuke}
    >
      <div className="text-2xl">
        <TbRadioactive />
      </div>
      <div className="font-mono text-[10px] uppercase text-center font-semibold">
        <div>Nuke</div>
      </div>
    </div>
  );
};
