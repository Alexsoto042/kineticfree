import toast from 'react-hot-toast';

export const useToasts = () => {
  const showSuccessToast = (message: string) => {
    toast.success(message, {
      style: {
        background: 'var(--color-success)',
        color: '#fff',
      },
      iconTheme: {
        primary: '#fff',
        secondary: 'var(--color-success)',
      },
    });
  };

  const showErrorToast = (message: string) => {
    toast.error(message, {
      style: {
        background: 'var(--color-danger)',
        color: '#fff',
      },
      iconTheme: {
        primary: '#fff',
        secondary: 'var(--color-danger)',
      },
    });
  };

  return { showSuccessToast, showErrorToast };
};