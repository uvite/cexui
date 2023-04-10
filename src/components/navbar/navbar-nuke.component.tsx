import React from 'react';
import { TbRadioactive } from 'react-icons/tb';

import { useNuke } from '../../hooks/use-nuke.hooks';

export const NavbarNukeButton = () => {
  const nuke = useNuke();

  return (
    <div
      className="border-dark-border-gray-2 text-dark-border-gray-2 flex w-14 cursor-pointer select-none flex-col items-center justify-center rounded-sm border last:mr-0 hover:border-red-500 hover:text-red-500"
      onClick={nuke}
    >
      <div className="text-2xl">
        <TbRadioactive />
      </div>
      <div className="text-center font-mono text-[10px] font-semibold uppercase">
        <div>Nuke</div>
      </div>
    </div>
  );
};
