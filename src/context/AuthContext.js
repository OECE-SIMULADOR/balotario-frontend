import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/AuthService'; // Asegúrate que AuthService.js existe y está bien nombrado
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decodedUser = jwtDecode(token);
            // Aquí también es bueno validar si el token ha expirado.
            // const isExpired = decodedUser.exp * 1000 < Date.now();
            // if (isExpired) throw new Error("Token expired");
            setUser({ id: decodedUser.user.id, role: decodedUser.user.role });
        } catch (error) {
            // Si hay CUALQUIER error con el token, simplemente lo removemos
            // No necesitamos llamar a logout() aquí
            localStorage.removeItem('token');
            setUser(null);
        }
    }
    setLoading(false);
    }, [token]);

    const handleAuth = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken); // Actualiza el estado del token, lo que re-ejecutará el useEffect
        navigate('/inicio'); // Redirección ÚNICA y CENTRALIZADA
    };
    
    const login = async (userData) => {
        try {
            const data = await authService.login(userData);
            handleAuth(data.token);
            toast.success('¡Bienvenido/a de nuevo!');
        } catch (error) { throw error; }
    };
    
    const register = async (userData) => {
        try {
            const data = await authService.register(userData);
            handleAuth(data.token);
            toast.success('¡Registro exitoso! Bienvenido/a.');
        } catch (error) { throw error; }
    };

    const loginWithGoogle = async (googleToken) => {
        try {
            const data = await authService.loginWithGoogle(googleToken);
            handleAuth(data.token);
            toast.success('¡Bienvenido/a a través de Google!');
        } catch (error) { throw error; }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    const value = { user, isAuthenticated: !!user, loading, login, register, loginWithGoogle, logout };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);