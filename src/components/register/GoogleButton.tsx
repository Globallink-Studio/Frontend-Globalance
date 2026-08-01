import React from "react";

interface googleButtonProps {
    text: string;
    onClick?: () => void;
}

export const GoogleButton: React.FC<googleButtonProps> = ({
    text = "Continuar con Google",
    onClick
}) => {
    const handleGoogleClick = () => {
        if (onClick) {
            onClick();
        } else {
            console.log("Iniciando autenticación con Google 0Auth...");
            alert("Simulación: REdirigiendo al flujo de autenticación de Google")
        }
    };

    return (
        <button onClick={handleGoogleClick}>
            <span>🌐</span>
            {text}
        </button>
    );
}
