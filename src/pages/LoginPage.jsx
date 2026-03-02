// src/pages/LoginPage.js

import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
    // Declaración de estados
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login, loginWithGoogle, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- >> ESTAS FUNCIONES FALTABAN << ---

    // Manejador para los cambios en los inputs del formulario
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Manejador para el envío del formulario tradicional
    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(formData);
        } catch (err) {
            setError(err.msg || 'Credenciales inválidas.');
        } finally {
            setLoading(false);
        }
    };
    
    // Manejador para el éxito del login con Google
    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            await loginWithGoogle(credentialResponse.credential);
        } catch (error) {
            setError(error.msg || "No se pudo iniciar sesión con Google.");
        } finally {
            setLoading(false);
        }
    };
    
    // Manejador para el error del login con Google
    const handleGoogleError = () => {
        setError('El inicio de sesión con Google falló.');
    };
    // ------------------------------------
    
    if (isAuthenticated) {
        return <Navigate to="/inicio" replace />;
    }
    
    return (
        <div className="auth-container">
            {loading && <Spinner />}
            <h1>Iniciar Sesión</h1>
            <Alert message={error} type="error" />
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <input type="email" name="email" value={formData.email} onChange={onChange} required placeholder="Correo Electrónico" />
                </div>
                <div className="form-group">
                    <input type="password" name="password" value={formData.password} onChange={onChange} required placeholder="Contraseña" />
                </div>
                <button type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'Entrar'}</button>
            </form>
            <p className="auth-switch-link">¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link></p>
            <div className="social-login-divider">
                <span className="divider-line"></span><span className="divider-text">O</span><span className="divider-line"></span>
            </div>
            <div className={`social-login-container ${loading ? 'disabled' : ''}`}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap />
            </div>
        </div>
    );
};

export default LoginPage;