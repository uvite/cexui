import { AES } from 'crypto-ts';
export const crypt = (msg: string) => {
  const encryptedMessage = AES.encrypt(msg, 'test').toString();
  return encryptedMessage;
};
