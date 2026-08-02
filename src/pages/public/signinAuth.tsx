import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../../components/register/AuthCard";
import { InputField } from "../../components/register/InputField";
import { GoogleButton } from "../../components/register/GoogleButton";
import { useAuth } from "../../providers/authentication/AuthContext";

interface SigninAuthState {
    email: string;
    password: string;
}

export default function SigninAuth() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [formData, setFormData] = useState<SigninAuthState>({
        email: '',
        password: '',
    });
    const [errorMessage, setErrorMessage] = useState<string>('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setErrorMessage('Por favor, completa todos los campos');
            return;
        }
        setErrorMessage('');
        try {
            await login(formData.email);
            navigate('/dashboard');
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Error al iniciar sesión');
        }
    };

    return (
        <AuthCard
            title="Inicia Sesión"
            subtitle="Bienvenido, ingresa tus datos para acceder a tu cuenta"
            errorMessage={errorMessage}
        >
            <form onSubmit={handleSubmit}>
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
                <button type="submit">
                    Ingresar
                </button>
                <hr />

                <GoogleButton text="Continuar con Google" onClick={() => { }} />

                <div>
                    <p>¿Aún no tienes cuenta? <Link to="/signup">Regístrate aquí</Link></p>
                    <p><Link to="/">← Volver al inicio</Link></p>
                </div>
            </form>
        </AuthCard>
    )
}
