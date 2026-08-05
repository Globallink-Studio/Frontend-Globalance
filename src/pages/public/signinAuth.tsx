import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../../components/register/AuthCard";
import { InputField } from "../../components/register/InputField";
import { GoogleButton } from "../../components/register/GoogleButton";
import { useAuth } from "../../providers/authentication/AuthContext";
import { AccountTypeToggle, type AccountType } from "../../components/register/AccountTypeToggle";
import { useAuthForm } from "../../hooks/useAuthForm";
import { validateSigninField, validateSigninForm, type SigninFormValues } from "../../utils/authValidation";
import "../../styles/pages/public/auth-common.css";
import "../../styles/pages/public/signin.css";

const accountOptions = [
    { value: "personal" as AccountType, label: "Personal", description: "Cuenta individual" },
    { value: "business" as AccountType, label: "Empresa", description: "Cuenta organizacional" },
];

export default function SigninAuth() {
    const navigate = useNavigate()
    const { login, loginWithGoogle } = useAuth()
    const [accountType, setAccountType] = useState<AccountType>('personal');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleAccountTypeChange = (accountType: AccountType) => {
        setAccountType(accountType);
    }

    const handleSubmitLogin = async (values: SigninFormValues) => {
        setErrorMessage('');
        try {
            await login(values.email, values.password);
            navigate('/dashboard');
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Error al iniciar sesión');
        }
    };

    const form = useAuthForm<SigninFormValues>({
        initialValues: { email: '', password: '' },
        validateField: validateSigninField,
        validateForm: validateSigninForm,
        onSubmit: handleSubmitLogin,
    });

    const { values, errors, isSubmitting, isChecked, handleChange: formChange, handleBlur, handleSubmit } = form;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (errorMessage) setErrorMessage('');
        formChange(e);
    };

    const handleGoogleLogin = async () => {
        setErrorMessage('');
        setGoogleLoading(true);
        try {
            await loginWithGoogle();
            navigate('/dashboard');
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Error al iniciar sesión con Google');
        } finally {
            setGoogleLoading(false);
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
                        value={accountType}
                        onChange={handleAccountTypeChange}
                        options={accountOptions}
                    />
                </div>
                <InputField
                    label="Correo electrónico"
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={values.email}
                    placeholder="Correo electrónico"
                    required
                    error={errors.email}
                    valid={isChecked('email') && !errors.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
                <InputField
                    label="Contraseña"
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    value={values.password}
                    placeholder="Contraseña"
                    required
                    error={errors.password}
                    valid={isChecked('password') && !errors.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
                <button className="auth-button" type="submit" disabled={isSubmitting || googleLoading}>
                    {isSubmitting ? 'Ingresando...' : 'Ingresar'}
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
