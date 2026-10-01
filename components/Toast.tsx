'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 md:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success' || !toast.type;
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-card border border-valuecart-border/80 animate-fade-in transition-all"
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-valuecart-green" />}
              {isWarning && <AlertCircle className="w-5 h-5 text-valuecart-orange" />}
              {!isSuccess && !isWarning && <Info className="w-5 h-5 text-valuecart-navy" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-valuecart-navy leading-tight">
                {toast.title}
              </h4>
              <p className="text-xs text-valuecart-text-muted mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-valuecart-navy p-1 rounded-md transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
