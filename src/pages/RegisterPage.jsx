// src/pages/RegisterPage.js

import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const RegisterPage = () => {
    // Declaración de estados
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { register, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- >> ESTAS FUNCIONES FALTABAN << ---

    // Manejador para los cambios en los inputs
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Manejador para el envío del formulario
    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(formData);
        } catch (err) {
            setError(err.msg || 'No se pudo completar el registro.');
        } finally {
            setLoading(false);
        }
    };
    // ------------------------------------
    
    if (isAuthenticated) {
        return <Navigate to="/inicio" replace />;
    }
    
    return (
        <div className="auth-container">
            {loading && <Spinner />}
            <h1>Crear una Cuenta</h1>
            <Alert message={error} type="error" />
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <input type="text" name="name" value={formData.name} placeholder="Nombre Completo" onChange={onChange} required />
                </div>
                <div className="form-group">
                    <input type="email" name="email" value={formData.email} placeholder="Correo Electrónico" onChange={onChange} required />
                </div>
                <div className="form-group">
                    <input type="password" name="password" value={formData.password} placeholder="Contraseña (mínimo 6 caracteres)" onChange={onChange} required minLength="6" />
                </div>
                <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Crear Cuenta'}</button>
            </form>
            <p className="auth-switch-link">¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión aquí</Link></p>
        </div>
    );
};

export default RegisterPage;