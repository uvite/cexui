import React from 'react';
import { FaTwitter, FaDiscord, FaMedium } from 'react-icons/fa';

export const ContactComponent = () => {
  return (
    <div className="ml-auto flex items-center">
      <a href="https://twitter.com/tuleep_trade" target="_blank" rel="noreferrer" className="mr-2">
        <span className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-white">
          <FaTwitter className="text-dark-bg text-xl" />
        </span>
      </a>
      <a href="https://blog.tuleep.trade" target="_blank" rel="noreferrer" className="mr-2">
        <span className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-white">
          <FaMedium className="text-dark-bg text-xl" />
        </span>
      </a>
      <a href="https://discord.gg/j2txjpXMdm" target="_blank" rel="noreferrer">
        <span className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-white">
          <FaDiscord className="text-dark-bg text-xl" />
        </span>
      </a>
    </div>
  );
};
