"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext({
  showToast: () => {},
});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "default") => {
    setToast({ message, type, id: Date.now() });

    window.setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  const toastClassName = ["toast", toast?.type === "error" && "toast--error", toast?.type === "success" && "toast--success", toast && "is-visible"]
    .filter(Boolean)
    .join(" ");

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div className={toastClassName} role="status">
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
