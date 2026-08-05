import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Building2 } from "lucide-react";
import { AuthCard } from "../../components/register/AuthCard";
import { InputField } from "../../components/register/InputField";
import { AccountTypeCards } from "../../components/register/AccountTypeCards";
import { AuthModal } from "../../components/register/AuthModal";
import type { AccountType } from "../../components/register/AccountTypeToggle";
import { useAuth } from "../../providers/authentication/AuthContext";
import { useAuthForm } from "../../hooks/useAuthForm";
import {
    validateSignupField,
    validateSignupForm,
    type SignupFormValues,
} from "../../utils/authValidation";
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

const initialFormValues: SignupFormValues = {
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
    const [errorMessage, setErrorMessage] = useState<string>('');

    const isPersonal = selectedType === "personal";

    const handleRegister = async (values: SignupFormValues) => {
        setErrorMessage('');
        const fullName = isPersonal ? `${values.firstName} ${values.lastName}`.trim() : values.legalName.trim();
        try {
            await register({ fullName, email: values.email, password: values.password });
            navigate('/dashboard');
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Error al registrarse');
        }
    };

    const form = useAuthForm<SignupFormValues>({
        initialValues: initialFormValues,
        validateField: (field, values) => validateSignupField(field, values, selectedType),
        validateForm: (values) => validateSignupForm(values, selectedType),
        onSubmit: handleRegister,
        liveFields: ['password', 'confirmPassword'],
    });

    const { values, errors, isSubmitting, isChecked, handleChange: formChange, handleBlur, handleSubmit, reset } = form;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (errorMessage) setErrorMessage('');
        formChange(e);
    };

    const openModal = (accountType: AccountType): void => {
        setErrorMessage('');
        setSelectedType(accountType);
        reset();
    };

    const closeModal = (): void => {
        setSelectedType(null);
        setErrorMessage('');
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
                                value={values.firstName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Juan"
                                autoComplete="given-name"
                                required
                                error={errors.firstName}
                                valid={isChecked('firstName') && !errors.firstName}
                            />
                            <InputField
                                label="Apellido:"
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={values.lastName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Pérez"
                                autoComplete="family-name"
                                required
                                error={errors.lastName}
                                valid={isChecked('lastName') && !errors.lastName}
                            />
                            <InputField
                                label="Documento:"
                                type="text"
                                id="document"
                                name="document"
                                value={values.document}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="DNI 30123456"
                                autoComplete="off"
                                required
                                error={errors.document}
                                valid={isChecked('document') && !errors.document}
                            />
                            <InputField
                                label="Teléfono:"
                                type="text"
                                id="phone"
                                name="phone"
                                value={values.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="+54 11 5555-0101"
                                autoComplete="tel"
                            />
                        </>
                    ) : (
                        <>
                            <InputField
                                label="Razón Social:"
                                type="text"
                                id="legalName"
                                name="legalName"
                                value={values.legalName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Globallink Studio S.R.L."
                                autoComplete="organization"
                                required
                                error={errors.legalName}
                                valid={isChecked('legalName') && !errors.legalName}
                            />
                            <InputField
                                label="Documento:"
                                type="text"
                                id="document"
                                name="document"
                                value={values.document}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="30-71234567-8"
                                autoComplete="off"
                                required
                                error={errors.document}
                                valid={isChecked('document') && !errors.document}
                            />
                            <InputField
                                label="Teléfono:"
                                type="text"
                                id="phone"
                                name="phone"
                                value={values.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="+54 11 5555-0201"
                                autoComplete="tel"
                            />
                        </>
                    )}

                    <InputField
                        label="Correo Electrónico:"
                        type="email"
                        id="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="tuemail@ejemplo.com"
                        autoComplete="email"
                        required
                        error={errors.email}
                        valid={isChecked('email') && !errors.email}
                    />

                    <InputField
                        label="Contraseña:"
                        type="password"
                        id="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                        required
                        error={errors.password}
                        valid={isChecked('password') && !errors.password}
                    />

                    <InputField
                        label="Confirmar Contraseña:"
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                        required
                        error={errors.confirmPassword}
                        valid={isChecked('confirmPassword') && !errors.confirmPassword}
                    />

                    {errorMessage && <p className="auth-modal__error" role="alert">{errorMessage}</p>}

                    <button className="auth-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
                    </button>
                </form>
            </AuthModal>
        </AuthCard>
    );
};
