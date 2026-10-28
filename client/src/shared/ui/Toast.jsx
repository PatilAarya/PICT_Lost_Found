// Short pop-up messages at the bottom of the screen.
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);
const SHOW_MS = 4000;

export function ToastProvider({ children }) {
  const [messages, setMessages] = useState([]);

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

export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) {
    throw new Error('useToast must be used inside <ToastProvider>.');
  }
  return showToast;
}
