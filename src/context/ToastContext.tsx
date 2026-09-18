"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

/** Optional action button on a toast (e.g. "Undo"). */
export interface ToastAction {
  label: string;
  fn: () => void;
}

type ToastFn = (icon: LucideIcon, title: string, msg?: string, action?: ToastAction) => void;

interface ToastItem {
  id: number;
  icon: LucideIcon;
  title: string;
  msg?: string;
  action?: ToastAction;
}

const ToastContext = createContext<ToastFn | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback<ToastFn>(
    (icon, title, msg, action) => {
      const id = ++idRef.current;
      // keep a maximum of 3 toasts on screen (same as the template)
      setToasts((t) => [...t.slice(-2), { id, icon, title, msg, action }]);
      // actionable toasts live a little longer, so the undo is reachable
      window.setTimeout(() => dismiss(id), action ? 6000 : 4200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div id="toasts" aria-live="polite">
        {toasts.map((t) => (
          <Toast key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [on, setOn] = useState(false);
  const Icon = item.icon;

  useEffect(() => {
    const r = requestAnimationFrame(() =>
      requestAnimationFrame(() => setOn(true))
    );
    return () => cancelAnimationFrame(r);
  }, []);

  return (
    <div className={`toast${on ? " on" : ""}`} role="status">
      <span className="t-ico">
        <Icon />
      </span>
      <div>
        <strong>{item.title}</strong>
        {item.msg && <p>{item.msg}</p>}
      </div>
      {item.action && (
        <button
          type="button"
          className="t-act"
          onClick={() => {
            item.action!.fn();
            onDismiss();
          }}
        >
          {item.action.label}
        </button>
      )}
      <button type="button" className="t-x" aria-label="Dismiss" onClick={onDismiss}>
        &times;
      </button>
    </div>
  );
}

export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}