import { TriangleAlert } from 'lucide-react';
import Modal from './Modal';

/** "Are you sure?" dialog used before destructive actions. */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} labelledBy="confirm-title" className="modal--confirm">
      <div className="modal__body">
        <span className="modal__icon">
          <TriangleAlert size={22} aria-hidden="true" />
        </span>
        <h2 id="confirm-title" className="modal__title">
          {title}
        </h2>
        <p className="modal__text">{message}</p>
        <div className="modal__actions">
          {/* Cancel comes first so it receives focus – the safe default. */}
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
