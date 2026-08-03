import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../../components/register/AuthCard";
import { InputField } from "../../components/register/InputField";
import { GoogleButton } from "../../components/register/GoogleButton";
import { useAuth } from "../../providers/authentication/AuthContext";
import { AccountTypeToggle, type AccountType } from "../../components/register/AccountTypeToggle";
import "../../styles/pages/public/auth-common.css";
import "../../styles/pages/public/signin.css";

interface SigninAuthState {
    accountType: AccountType;
    email: string;
    password: string;
}

const accountOptions = [
    { value: "personal" as AccountType, label: "Personal", description: "Cuenta individual" },
    { value: "business" as AccountType, label: "Empresa", description: "Cuenta organizacional" },
];

export default function SigninAuth() {
    const navigate = useNavigate()
    const { login, loginWithGoogle } = useAuth()
    const [formData, setFormData] = useState<SigninAuthState>({
        accountType: 'personal',
        email: '',
        password: '',
    });
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    const handleAccountTypeChange = (accountType: AccountType) => {
        setFormData((prev) => ({ ...prev, accountType }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setErrorMessage('Por favor, completa todos los campos');
            return;
        }
        setErrorMessage('');
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setErrorMessage('');
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate('/dashboard');
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Error al iniciar sesión con Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Inicia Sesión"
            subtitle="Bienvenido, ingresa tus datos para acceder a tu cuenta"
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
                    label="Correo electrónico"
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    placeholder="Correo electrónico"
                    required
                    onChange={handleChange}
                />
                <InputField
                    label="Contraseña"
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    placeholder="Contraseña"
                    required
                    onChange={handleChange}
                />
                <button className="auth-button" type="submit" disabled={loading}>
                    {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
                <div className="auth-divider">
                    <span>o continúa con</span>
                </div>

                <GoogleButton text="Continuar con Google" onClick={handleGoogleLogin} />

                <div className="auth-links">
                    <p>¿Aún no tienes cuenta? <Link to="/signup">Regístrate aquí</Link></p>
                    <p><Link to="/">← Volver al inicio</Link></p>
                </div>
            </form>
        </AuthCard>
    )
}
