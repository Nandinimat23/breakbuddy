import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import "./Modal.css";

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

/** Accessible modal dialog: traps focus visually, closes on Escape/backdrop. */
export function Modal({ open, onClose, title, children, actions }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="bb-modal-backdrop" onClick={onClose}>
      <div
        className="bb-modal card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bb-modal-title"
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="bb-modal-title" className="bb-modal-title">
          {title}
        </h2>
        <div className="bb-modal-body">{children}</div>
        {actions && <div className="bb-modal-actions">{actions}</div>}
      </div>
    </div>
  );
}
