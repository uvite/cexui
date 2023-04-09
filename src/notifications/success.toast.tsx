import React from 'react';
import { toast } from 'react-toastify';

export const successToast = (message: string) => {
  toast(<div className="font-mono text-sm">{message}</div>, {
    type: 'success',
  });
};
