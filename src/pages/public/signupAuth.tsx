import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Building2 } from "lucide-react";
import { AuthCard } from "../../components/register/AuthCard";
import { InputField } from "../../components/register/InputField";
import { AccountTypeCards } from "../../components/register/AccountTypeCards";
import { AuthModal } from "../../components/register/AuthModal";
import type { AccountType } from "../../components/register/AccountTypeToggle";
import { useAuth } from "../../providers/authentication/AuthContext";
import "../../styles/pages/public/auth-common.css";
import "../../styles/pages/public/signup.css";

interface SignupFormState {
    accountType: AccountType | null;
    firstName: string;
    lastName: string;
    legalName: string;
    document: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
}

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

const initialState: SignupFormState = {
    accountType: null,
    firstName: '',
    lastName: '',
    legalName: '',
    document: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
};

export default function SignupAuth() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [selectedType, setSelectedType] = useState<AccountType | null>(null);
    const [formData, setFormData] = useState<SignupFormState>(initialState);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const isPersonal = selectedType === "personal";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const openModal = (accountType: AccountType): void => {
        setFormData((prev) => ({ ...prev, accountType }));
        setErrorMessage('');
        setSelectedType(accountType);
    };

    const closeModal = (): void => {
        setSelectedType(null);
        setErrorMessage('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        const { firstName, lastName, legalName, document: doc, email, password, confirmPassword } = formData;
        const fullName = isPersonal ? `${firstName} ${lastName}`.trim() : legalName.trim();

        if (!fullName || !doc.trim() || !email || !password || !confirmPassword) {
            setErrorMessage('Por favor, completa todos los campos');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            setErrorMessage('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        setErrorMessage('');
        setLoading(true);
        try {
            await register({ fullName, email, password });
            navigate('/dashboard');
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Crear una Cuenta"
            subtitle="Únete y gestiona tus monedas en un solo lugar"
        >
            <div className="signup-select">
                <span className="signup-select__label">Selecciona tu tipo de cuenta</span>
                <AccountTypeCards options={accountOptions} onSelect={openModal} />
            </div>

            <div className="auth-links">
                <p>¿Ya tienes cuenta? <Link to="/signin">Inicia sesión aquí</Link></p>
                <p><Link to="/">← Volver al inicio</Link></p>
            </div>

            <AuthModal
                open={selectedType !== null}
                onClose={closeModal}
                title={isPersonal ? "Cuenta Personal" : "Cuenta Empresa"}
                subtitle={isPersonal ? "Completa tus datos para crear tu cuenta" : "Completá los datos de tu organización"}
                icon={
                    isPersonal
                        ? <User className="auth-modal__icon-svg" />
                        : <Building2 className="auth-modal__icon-svg" />
                }
            >
                <form className="auth-form" onSubmit={handleSubmit}>
                    {isPersonal ? (
                        <>
                            <InputField
                                label="Nombre:"
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Juan"
                                required
                            />
                            <InputField
                                label="Apellido:"
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Pérez"
                                required
                            />
                            <InputField
                                label="Documento:"
                                type="text"
                                id="document"
                                name="document"
                                value={formData.document}
                                onChange={handleChange}
                                placeholder="DNI 30123456"
                                required
                            />
                            <InputField
                                label="Teléfono:"
                                type="text"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+54 11 5555-0101"
                            />
                        </>
                    ) : (
                        <>
                            <InputField
                                label="Razón Social:"
                                type="text"
                                id="legalName"
                                name="legalName"
                                value={formData.legalName}
                                onChange={handleChange}
                                placeholder="Globallink Studio S.R.L."
                                required
                            />
                            <InputField
                                label="Documento:"
                                type="text"
                                id="document"
                                name="document"
                                value={formData.document}
                                onChange={handleChange}
                                placeholder="30-71234567-8"
                                required
                            />
                            <InputField
                                label="Teléfono:"
                                type="text"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+54 11 5555-0201"
                            />
                        </>
                    )}

                    <InputField
                        label="Correo Electrónico:"
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tuemail@ejemplo.com"
                        required
                    />

                    <InputField
                        label="Contraseña:"
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        required
                    />

                    <InputField
                        label="Confirmar Contraseña:"
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        required
                    />

                    {errorMessage && <p className="auth-modal__error" role="alert">{errorMessage}</p>}

                    <button className="auth-button" type="submit" disabled={loading}>
                        {loading ? 'Registrando...' : 'Crear cuenta'}
                    </button>
                </form>
            </AuthModal>
        </AuthCard>
    );
};
