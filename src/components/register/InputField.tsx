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
                        {showPassword ? <EyeOff className="input-field__toggle-icon" /> : <Eye className="input-field__toggle-icon" />}
                    </button>
                )}
            </div>
        </div>
    )
}
