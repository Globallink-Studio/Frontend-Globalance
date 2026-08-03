import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../../components/register/AuthCard";
import { InputField } from "../../components/register/InputField";
import { AccountTypeToggle, type AccountType } from "../../components/register/AccountTypeToggle";
import "../../styles/pages/public/auth-common.css";
import "../../styles/pages/public/signup.css";


interface SignupFormState {
    accountType: AccountType;
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const accountOptions = [
    {
        value: "personal" as AccountType,
        label: "Personal",
        description: "Gestiona tus finanzas",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
    {
        value: "business" as AccountType,
        label: "Empresa",
        description: "Operá como organización",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V7l7-4 7 4v14" />
                <path d="M9 9h1" />
                <path d="M9 13h1" />
                <path d="M9 17h1" />
                <path d="M14 9h1" />
                <path d="M14 13h1" />
                <path d="M14 17h1" />
            </svg>
        ),
    },
];

export default function SignupAuth() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<SignupFormState>({
        accountType: 'personal',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAccountTypeChange = (accountType: AccountType): void => {
        setFormData((prev) => ({ ...prev, accountType }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
            setErrorMessage('Por favor, completa todos los campos');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden');
            return;
        }
        if (formData.password.length < 6) {
            setErrorMessage('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        setErrorMessage('');
        console.log("Registro:", formData);
        navigate('/signin');
    };

    return (
        <AuthCard
            title="Crear una Cuenta"
            subtitle="Únete y gestiona tus monedas en un solo lugar"
            errorMessage={errorMessage}
        >
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-form__toggle">
                    <span className="auth-form__toggle-label">Tipo de cuenta</span>
                    <AccountTypeToggle
                        value={formData.accountType}
                        onChange={handleAccountTypeChange}
                        options={accountOptions}
                    />
                </div>

                <InputField
                    label="Nombre Completo:"
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    required
                />

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
                    placeholder="Repite tu contraseña"
                    required
                />

                <button className="auth-button" type="submit">Registrarme</button>
            </form>

            <div className="auth-links">
                <p>¿Ya tienes cuenta? <Link to="/signin">Inicia sesión aquí</Link></p>
                <p><Link to="/">← Volver al inicio</Link></p>
            </div>
        </AuthCard>
    );
};
