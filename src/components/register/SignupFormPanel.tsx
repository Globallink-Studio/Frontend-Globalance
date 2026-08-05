import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Building2, ArrowLeft } from "lucide-react";
import type { AccountType } from "./AccountTypeToggle";
import { InputField } from "./InputField";
import { useAuth } from "../../providers/authentication/AuthContext";
import { useAuthForm } from "../../hooks/useAuthForm";
import {
    validateSignupField,
    validateSignupForm,
    type SignupFormValues,
} from "../../utils/authValidation";
import "../../styles/pages/public/signup.css";

interface SignupFormPanelProps {
    accountType: AccountType;
    onBack: () => void;
}

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

export const SignupFormPanel: React.FC<SignupFormPanelProps> = ({ accountType, onBack }) => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [errorMessage, setErrorMessage] = useState<string>('');
    const isPersonal = accountType === "personal";

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
        validateField: (field, values) => validateSignupField(field, values, accountType),
        validateForm: (values) => validateSignupForm(values, accountType),
        onSubmit: handleRegister,
        liveFields: ['password', 'confirmPassword'],
    });

    const { values, errors, isSubmitting, isChecked, handleChange: formChange, handleBlur, handleSubmit } = form;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (errorMessage) setErrorMessage('');
        formChange(e);
    };

    return (
        <div className={`signup-panel signup-panel--${accountType}`}>
            <header className="signup-panel__header">
                <button type="button" className="signup-panel__back" onClick={onBack}>
                    <ArrowLeft className="signup-panel__back-icon" />
                    Volver
                </button>
                <span className="signup-panel__icon" aria-hidden="true">
                    {isPersonal
                        ? <User className="signup-panel__icon-svg" />
                        : <Building2 className="signup-panel__icon-svg" />}
                </span>
                <div className="signup-panel__heading">
                    <h2 className="signup-panel__title">{isPersonal ? "Cuenta Personal" : "Cuenta Empresa"}</h2>
                    <p className="signup-panel__subtitle">
                        {isPersonal
                            ? "Completa tus datos para crear tu cuenta"
                            : "Completá los datos de tu organización"}
                    </p>
                </div>
            </header>

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
                    </>
                ) : (
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
                )}

                <InputField
                    label="Documento:"
                    type="text"
                    id="document"
                    name="document"
                    value={values.document}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={isPersonal ? "DNI 30123456" : "30-71234567-8"}
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

                {errorMessage && <p className="signup-panel__error" role="alert">{errorMessage}</p>}

                <button className="auth-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
                </button>
            </form>
        </div>
    );
};
