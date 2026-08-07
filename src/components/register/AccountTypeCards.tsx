import React from "react";
import { ArrowRight } from "lucide-react";
import type { AccountType } from "./AccountTypeToggle";
import "../../styles/components/account-type-cards.css";

interface AccountTypeCardsOption {
    value: AccountType;
    label: string;
    description: string;
    icon: React.ReactNode;
    tint?: "lilac" | "mint";
}

interface AccountTypeCardsProps {
    options: AccountTypeCardsOption[];
    selected?: AccountType;
    onSelect: (type: AccountType) => void;
}

export const AccountTypeCards: React.FC<AccountTypeCardsProps> = ({
    options,
    selected,
    onSelect,
}) => {
    const isSelected = (value: AccountType): boolean => value === selected;

    return (
        <div className="account-type-cards">
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected(option.value)}
                    className={`account-type-cards__card${option.tint ? ` account-type-cards__card--${option.tint}` : ""}${isSelected(option.value) ? " account-type-cards__card--selected" : ""}`}
                    onClick={() => onSelect(option.value)}
                >
                    <span className="account-type-cards__icon" aria-hidden="true">
                        {option.icon}
                    </span>
                    <span className="account-type-cards__label">{option.label}</span>
                    <span className="account-type-cards__description">{option.description}</span>
                    <span className="account-type-cards__arrow" aria-hidden="true">
                        <ArrowRight className="account-type-cards__arrow-icon" />
                    </span>
                </button>
            ))}
        </div>
    );
};
