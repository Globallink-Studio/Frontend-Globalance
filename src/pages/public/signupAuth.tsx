import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Building2 } from "lucide-react";
import { AuthCard } from "../../components/register/AuthCard";
import { InputField } from "../../components/register/InputField";
import { useAuth } from "../../providers/authentication/AuthContext";
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
        icon: <User className="account-type-toggle__icon" />,
    },
    {
        value: "business" as AccountType,
        label: "Empresa",
        description: "Operá como organización",
        icon: <Building2 className="account-type-toggle__icon" />,
    },
];

export default function SignupAuth() {
    const navigate = useNavigate();
    const { register } = useAuth();
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
        try {
            await register({ fullName: formData.fullName, email: formData.email });
            navigate('/dashboard');
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Error al registrarse');
        }
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
