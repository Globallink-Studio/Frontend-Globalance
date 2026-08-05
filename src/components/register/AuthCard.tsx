import React from "react";
import { Wallet } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import "../../styles/components/auth-card.css";

interface authCardProps {
    title?: string;
    subtitle?: string;
    errorMessage?: string;
    className?: string;
    children: React.ReactNode;
}

export const AuthCard: React.FC<authCardProps> = ({
    title,
    subtitle,
    errorMessage,
    className,
    children,
}) => {
    return (
        <main className="auth-page">
            <section className={`auth-card${className ? ` ${className}` : ""}`}>
                <header className="auth-card__header">
                    <div className="auth-card__brand">
                        <span className="auth-card__logo" aria-hidden="true">
                            <Wallet className="auth-card__logo-icon" />
                        </span>
                        <span className="auth-card__name">Globalance</span>
                    </div>
                    <ThemeToggle />
                </header>

                {title && <h1 className="auth-card__title">{title}</h1>}
                {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}

                {errorMessage && <p className="auth-card__error" role="alert">{errorMessage}</p>}

                <div className="auth-card__content">
                    {children}
                </div>
            </section>
        </main>
    )
}
