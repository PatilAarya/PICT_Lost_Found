// Bottom sheet dialog for details and confirmations.
import { useEffect, useRef } from 'react';
import { Icon } from './Icon.jsx';

export function Sheet({ open, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog ref={dialogRef} className="sheet" onClose={onClose} aria-label={title}>
      <header className="sheet-header">
        <h2>{title}</h2>
        <button type="button" className="icon-button" onClick={onClose}>
          <Icon name="close" />
          <span className="visually-hidden">Close</span>
        </button>
      </header>
      {children}
    </dialog>
  );
}
