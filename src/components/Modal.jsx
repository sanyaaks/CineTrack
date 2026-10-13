import { useEffect, useRef } from 'react';

/**
 * Accessible modal built on the native <dialog> element.
 * showModal() gives us focus trapping, the Escape key and a backdrop for free.
 */
export default function Modal({ open, onClose, labelledBy, className = '', children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${className}`}
      aria-labelledby={labelledBy}
      onClose={onClose} // fired by Escape or dialog.close()
      onClick={(event) => {
        // A click on the dialog element itself (not its content) is a click on the backdrop.
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {open && children}
    </dialog>
  );
}
