import React from 'react';
import type { ToastOptions } from 'react-toastify';
import { toast } from 'react-toastify';

export const errorToast = (error: React.ReactNode, options?: ToastOptions) => {
  toast(<div className="font-mono text-xs font-semibold">{error}</div>, {
    type: 'error',
    ...options,
  });
};
