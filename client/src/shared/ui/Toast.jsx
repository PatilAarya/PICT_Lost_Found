// Short messages at the bottom centre of the screen, for example "Claim sent".
// <ToastProvider> wraps the app (App.jsx); any component calls
// const toast = useToast(); toast('Saved'). Each message disappears after 4 seconds.
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);
const SHOW_MS = 4000;

export function ToastProvider({ children }) {
  const [messages, setMessages] = useState([]);

  // Add a message, then remove it again after SHOW_MS.
  const showToast = useCallback((text) => {
    const id = Date.now() + Math.random();
    setMessages((current) => [...current, { id, text }]);
    setTimeout(() => {
      setMessages((current) => current.filter((message) => message.id !== id));
    }, SHOW_MS);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* aria-live makes screen readers read new messages without moving focus. */}
      <div className="toasts" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className="toast">
            {message.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Return the function that shows a toast.
export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) {
    throw new Error('useToast must be used inside <ToastProvider>.');
  }
  return showToast;
}
