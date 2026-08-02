import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../../components/register/AuthCard";
import { InputField } from "../../components/register/InputField";
import { useAuth } from "../../providers/authentication/AuthContext";


interface SignupFormState {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;

}
export default function SignupAuth() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState<SignupFormState>({
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
            <form onSubmit={handleSubmit}>
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

                <button type="submit">Registrarme</button>
            </form>

            <div>
                <p>¿Ya tienes cuenta? <Link to="/signin">Inicia sesión aquí</Link></p>
                <p><Link to="/">← Volver al inicio</Link></p>
            </div>
        </AuthCard>
    );
};

