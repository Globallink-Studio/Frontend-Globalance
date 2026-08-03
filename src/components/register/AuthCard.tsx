import React from "react";
import { ThemeToggle } from "../ThemeToggle";
import "../../styles/components/auth-card.css";

interface authCardProps {
    title: string;
    subtitle: string;
    errorMessage?: string;
    children: React.ReactNode;
}

export const AuthCard: React.FC<authCardProps> = ({
    title,
    subtitle,
    errorMessage,
    children,
}) => {
    return (
        <main className="auth-page">
            <section className="auth-card">
                <header className="auth-card__header">
                    <div className="auth-card__brand">
                        <span className="auth-card__logo" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12h2" />
                                <path d="M20 12h2" />
                                <path d="M6 12a6 6 0 0 1 12 0" />
                                <circle cx="12" cy="12" r="2" />
                            </svg>
                        </span>
                        <span className="auth-card__name">Globalance</span>
                    </div>
                    <ThemeToggle />
                </header>

                <h1 className="auth-card__title">{title}</h1>
                <p className="auth-card__subtitle">{subtitle}</p>

                {errorMessage && <p className="auth-card__error" role="alert">{errorMessage}</p>}

                <div className="auth-card__content">
                    {children}
                </div>
            </section>
        </main>
    )
}
