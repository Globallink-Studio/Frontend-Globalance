import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Building2 } from "lucide-react";
import { AuthCard } from "../../components/register/AuthCard";
import { AccountTypeCards } from "../../components/register/AccountTypeCards";
import { SignupFormPanel } from "../../components/register/SignupFormPanel";
import { AuthModal } from "../../components/register/AuthModal";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import type { AccountType } from "../../components/register/AccountTypeToggle";
import "../../styles/pages/public/auth-common.css";
import "../../styles/pages/public/signup.css";

const accountOptions = [
    {
        value: "personal" as AccountType,
        label: "Personal",
        description: "Gestiona tus finanzas",
        icon: <User className="account-type-cards__icon-svg" />,
        tint: "lilac" as const,
    },
    {
        value: "business" as AccountType,
        label: "Empresa",
        description: "Opera como organización",
        icon: <Building2 className="account-type-cards__icon-svg" />,
        tint: "mint" as const,
    },
];

export default function SignupAuth() {
    const [selectedType, setSelectedType] = useState<AccountType | null>(null);
    const isMobile = useMediaQuery("(max-width: 46rem)");
    const hasPanel = selectedType !== null;
    const isPersonal = selectedType === "personal";

    const panelTitle = isPersonal ? "Cuenta Personal" : "Cuenta Empresa";
    const panelSubtitle = isPersonal
        ? "Completa tus datos para crear tu cuenta"
        : "Completá los datos de tu organización";
    const panelIcon = isPersonal
        ? <User className="auth-modal__icon-svg" />
        : <Building2 className="auth-modal__icon-svg" />;

    const openPanel = (accountType: AccountType): void => {
        setSelectedType(accountType);
    };

    const closePanel = (): void => {
        setSelectedType(null);
    };

    return (
        <AuthCard className={hasPanel && !isMobile ? "auth-card--signup" : undefined}>
            <div className={`signup-layout signup-layout--${hasPanel && !isMobile ? "split" : "idle"}`}>
                <div className="signup-select">
                    <h1 className="signup-select__title">Crear una Cuenta</h1>
                    <p className="signup-select__subtitle">Únete y gestiona tus monedas en un solo lugar</p>
                    <span className="signup-select__label">Selecciona tu tipo de cuenta</span>
                    <AccountTypeCards
                        options={accountOptions}
                        selected={selectedType ?? undefined}
                        onSelect={openPanel}
                    />
                </div>

                {hasPanel && !isMobile && (
                    <SignupFormPanel
                        key={selectedType}
                        accountType={selectedType as AccountType}
                        onBack={closePanel}
                    />
                )}
            </div>

            <div className="auth-links">
                <p>¿Ya tienes cuenta? <Link to="/signin">Inicia sesión aquí</Link></p>
                <p><Link to="/">← Volver al inicio</Link></p>
            </div>

            {hasPanel && isMobile && (
                <AuthModal
                    open
                    onClose={closePanel}
                    title={panelTitle}
                    subtitle={panelSubtitle}
                    icon={panelIcon}
                >
                    <SignupFormPanel
                        key={selectedType}
                        accountType={selectedType as AccountType}
                        onBack={closePanel}
                    />
                </AuthModal>
            )}
        </AuthCard>
    );
};
