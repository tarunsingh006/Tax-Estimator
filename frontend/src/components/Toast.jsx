import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

let toastIndex = 0;
let observers = [];

export const showToast = (title, message, type = 'success', duration = 4000) => {
  const id = toastIndex++;
  const toast = { id, title, message, type, duration };
  observers.forEach((cb) => cb(toast));
};

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const onToast = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    };

    observers.push(onToast);
    return () => {
      observers = observers.filter((cb) => cb !== onToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, out: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type} ${t.out ? 'toast-out' : ''}`}
        >
          <div className="toast-icon">
            {t.type === 'success' && <CheckCircle size={20} color="#4ade80" />}
            {t.type === 'error' && <XCircle size={20} color="#f87171" />}
            {t.type === 'info' && <Info size={20} color="#60a5fa" />}
          </div>
          <div className="toast-content">
            <div className="toast-title">{t.title}</div>
            <div className="toast-message">{t.message}</div>
          </div>
          <div className="toast-close" onClick={() => removeToast(t.id)}>
            <X size={16} />
          </div>
          <div
            className="toast-progress"
            style={{ animationDuration: `${t.duration}ms` }}
          />
        </div>
      ))}
    </div>
  );
}
