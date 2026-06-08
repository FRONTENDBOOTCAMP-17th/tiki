import Toast from './Toast';
import { ToastData } from './Toast.types';

export default function ToastContainer({ toasts }: { toasts: ToastData[] }) {
  return (
    <div className='fixed top-4 right-4 z-50 flex flex-col gap-2'>
      {toasts.map((toast) => {
        return (
          <Toast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
          />
        );
      })}
    </div>
  );
}
