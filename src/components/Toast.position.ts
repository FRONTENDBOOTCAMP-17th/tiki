import { ToastPosition } from './Toast.types';

export const toastPositionMap: Record<ToastPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-24 left-4',
  'bottom-center': 'bottom-24 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-24 right-4',
};
Object.freeze(toastPositionMap);
