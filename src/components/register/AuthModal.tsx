import React, { useEffect } from "react";
import { X } from "lucide-react";
import "../../styles/components/auth-modal.css";

interface AuthModalProps {
    open: boolean;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    onClose: () => void;
    children: React.ReactNode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
    open,
    title,
    subtitle,
    icon,
    onClose,
    children,
}) => {
    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="auth-modal__backdrop" onClick={onClose}>
            <div
                className="auth-modal"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="auth-modal__header">
                    {icon && (
                        <span className="auth-modal__icon" aria-hidden="true">
                            {icon}
                        </span>
                    )}
                    <div className="auth-modal__heading">
                        <h2 className="auth-modal__title">{title}</h2>
                        {subtitle && <p className="auth-modal__subtitle">{subtitle}</p>}
                    </div>
                    <button
                        type="button"
                        className="auth-modal__close"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <X className="auth-modal__close-icon" />
                    </button>
                </header>
                <div className="auth-modal__content">{children}</div>
            </div>
        </div>
    );
};
