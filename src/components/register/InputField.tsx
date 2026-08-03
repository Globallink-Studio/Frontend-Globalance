import React, { useState } from "react";
import "../../styles/components/input-field.css";

interface InputFieldProps {
    label: string;
    type: "text" | "email" | "password";
    id: string;
    name: string;
    value: string;
    placeholder?: string;
    required?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
    label,
    type,
    id,
    name,
    value,
    placeholder,
    required,
    onChange,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
        <div className="input-field">
            <label className="input-field__label" htmlFor={id}>{label}</label>
            <div className={`input-field__wrapper${isPassword ? " input-field__wrapper--password" : ""}`}>
                <input
                    className="input-field__control"
                    type={inputType}
                    id={id}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    required={required}
                    onChange={onChange}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="input-field__toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPassword ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                <line x1="2" x2="22" y1="2" y2="22" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
