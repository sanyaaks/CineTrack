import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react';

const ICONS = { success: CircleCheck, info: Info, error: TriangleAlert };

/** Stack of toast notifications. `aria-live` makes screen readers announce them. */
export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] ?? Info;
        return (
          <div key={toast.id} className={`toast toast--${toast.type}`} role="status">
            <Icon size={18} aria-hidden="true" className="toast__icon" />
            <p className="toast__message">{toast.message}</p>
            <button type="button" className="toast__close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
