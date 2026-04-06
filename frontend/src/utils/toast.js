let toastIndex = 0;
const observers = new Set();

export const showToast = (title, message, type = 'success', duration = 4000) => {
  const id = toastIndex++;
  const toast = { id, title, message, type, duration };
  observers.forEach((cb) => cb(toast));
};

export const subscribeToasts = (callback) => {
  observers.add(callback);
  return () => {
    observers.delete(callback);
  };
};
