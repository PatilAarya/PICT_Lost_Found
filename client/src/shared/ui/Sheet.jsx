// STUB bottom sheet for details and confirmations: Sheet { open, onClose, title }.
// Built on the browser's own <dialog> element: showModal() traps focus and the Esc
// key fires "close", so we get accessibility without a library.
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
