import { ToastPosition } from './Toast.types';

export const toastAnimationMap: Record<
  ToastPosition | 'fade',
  { in: string; out: string }
> = {
  'top-left': {
    in: 'animate-slide-in-from-left',
    out: 'animate-slide-out-to-left',
  },
  'top-center': {
    in: 'animate-slide-in-from-top',
    out: 'animate-slide-out-to-top',
  },
  'top-right': {
    in: 'animate-slide-in-from-right',
    out: 'animate-slide-out-to-right',
  },
  'bottom-left': {
    in: 'animate-slide-in-from-left',
    out: 'animate-slide-out-to-left',
  },
  'bottom-center': {
    in: 'animate-slide-in-from-bottom',
    out: 'animate-slide-out-to-bottom',
  },
  'bottom-right': {
    in: 'animate-slide-in-from-right',
    out: 'animate-slide-out-to-right',
  },
  fade: {
    in: 'animate-fade-in',
    out: 'animate-fade-out',
  },
};
Object.freeze(toastAnimationMap);
