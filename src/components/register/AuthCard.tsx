import React from "react"

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
        <main>
            <section>
                <h1>{title}</h1>
                <p>{subtitle}</p>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                {children}
            </section>
        </main>
    )
}