import { errorToast } from '../notifications/error.toast';

export const fatFingerError = () => {
  errorToast('Order amount exceeds fat finger protection');
};
