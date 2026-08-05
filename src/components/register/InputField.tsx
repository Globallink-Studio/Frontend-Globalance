import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../../styles/components/input-field.css";

interface InputFieldProps {
    label: string;
    type: "text" | "email" | "password";
    id: string;
    name: string;
    value: string;
    placeholder?: string;
    required?: boolean;
    autoComplete?: string;
    error?: string;
    valid?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
    label,
    type,
    id,
    name,
    value,
    placeholder,
    required,
    autoComplete,
    error,
    valid,
    onChange,
    onBlur,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;
    const controlClass = [
        "input-field__control",
        error ? "input-field__control--error" : "",
        valid ? "input-field__control--valid" : "",
    ].filter(Boolean).join(" ");

    return (
        <div className="input-field">
            <label className="input-field__label" htmlFor={id}>
                {label}
                {required && (
                    <span className="input-field__required" title="Este campo es obligatorio" aria-hidden="true">
                        *
                    </span>
                )}
            </label>
            <div className={`input-field__wrapper${isPassword ? " input-field__wrapper--password" : ""}`}>
                <input
                    className={controlClass}
                    type={inputType}
                    id={id}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    required={required}
                    autoComplete={autoComplete}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onChange={onChange}
                    onBlur={onBlur}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="input-field__toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPassword ? <EyeOff className="input-field__toggle-icon" /> : <Eye className="input-field__toggle-icon" />}
                    </button>
                )}
            </div>
            {error && (
                <p className="input-field__error" id={`${id}-error`} role="alert">
                    {error}
                </p>
            )}
        </div>
    )
}
