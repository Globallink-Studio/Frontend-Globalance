import React from "react";
import "../../styles/components/account-type-toggle.css";

export type AccountType = "personal" | "business";

interface AccountTypeToggleProps {
    value: AccountType;
    onChange: (type: AccountType) => void;
    options: { value: AccountType; label: string; description?: string; icon?: React.ReactNode }[];
}

export const AccountTypeToggle: React.FC<AccountTypeToggleProps> = ({
    value,
    onChange,
    options,
}) => {
    return (
        <div className="account-type-toggle" role="radiogroup" aria-label="Tipo de cuenta">
            {options.map((option) => {
                const isActive = value === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        className={`account-type-toggle__option${isActive ? " account-type-toggle__option--active" : ""}`}
                        onClick={() => onChange(option.value)}
                    >
                        {option.icon && <span className="account-type-toggle__icon" aria-hidden="true">{option.icon}</span>}
                        <span className="account-type-toggle__label">{option.label}</span>
                        {option.description && (
                            <span className="account-type-toggle__description">{option.description}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
