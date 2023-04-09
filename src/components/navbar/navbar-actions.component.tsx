import cx from 'clsx';
import { useAtom } from 'jotai';
import React from 'react';
import { BiVolumeFull, BiVolumeMute } from 'react-icons/bi';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { MdOutlinePublic, MdOutlinePublicOff } from 'react-icons/md';

import {
  displayPreviewTradeAtom,
  privacyAtom,
  soundAtom,
} from '../../atoms/app.atoms';

import { NavbarNukeButton } from './navbar-nuke.component';
import { NavbarToggleBlocksComponent } from './navbar-toggle-blocks.component';

const NavbarActionButton = ({
  title: [titleOn, titleOff],
  value,
  toggle,
  icons: [Icon, IconActive],
}: {
  title: [string, string];
  value: boolean;
  toggle: (nextValue: boolean) => void;
  icons: [React.FC, React.FC];
}) => {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center border rounded-sm w-14 cursor-pointer select-none mr-4 last:mr-0',
        value
          ? 'border-dark-blue text-dark-blue'
          : 'border-dark-border-gray-2 text-dark-border-gray-2'
      )}
      onClick={() => toggle(!value)}
    >
      <div className="text-2xl">{value ? <Icon /> : <IconActive />}</div>
      <div className="font-mono text-[10px] uppercase text-center font-semibold">
        <div>{value ? titleOn : titleOff}</div>
      </div>
    </div>
  );
};

export const NavbarActionsComponent = () => {
  const [previewTrade, setPreviewTrade] = useAtom(displayPreviewTradeAtom);
  const [privacy, setPrivacy] = useAtom(privacyAtom);
  const [sound, setSound] = useAtom(soundAtom);

  return (
    <div className="flex">
      <div className="mx-4 h-[45px] w-[1px] bg-dark-border-gray" />
      <NavbarActionButton
        title={['preview', 'preview']}
        icons={[BsEye, BsEyeSlash]}
        value={previewTrade}
        toggle={setPreviewTrade}
      />
      <NavbarActionButton
        title={['private', 'public']}
        icons={[MdOutlinePublicOff, MdOutlinePublic]}
        value={privacy}
        toggle={setPrivacy}
      />
      <NavbarActionButton
        title={['sound', 'sound']}
        icons={[BiVolumeFull, BiVolumeMute]}
        value={sound}
        toggle={setSound}
      />
      <NavbarToggleBlocksComponent />
      <NavbarNukeButton />
    </div>
  );
};
