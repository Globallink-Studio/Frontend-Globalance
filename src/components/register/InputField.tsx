import React from "react";

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
    return (
        <div>
            <label htmlFor={id}>{label}</label>
            <input
                type={type}
                id={id}
                name={name}
                value={value}
                placeholder={placeholder}
                required={required}
                onChange={onChange} />
        </div>
    )
}