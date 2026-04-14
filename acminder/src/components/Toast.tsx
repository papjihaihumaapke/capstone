import { useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

export default function Toast() {
  const ctx = useContext(AppContext);
  const { toast, hideToast } = ctx || {};

  useEffect(() => {
    if (toast?.visible) {
      const timer = setTimeout(() => hideToast && hideToast(), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast?.visible, hideToast]);

  if (!toast?.visible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn">
      <div className="bg-dark text-white rounded-full px-5 py-2 text-caption">
        {toast.message}
      </div>
    </div>
  );
}