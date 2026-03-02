// src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/AuthService';
import { toast } from 'react-toastify';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isNewRegistration, setIsNewRegistration] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        setIsNewRegistration(false);
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                setUser({ id: decodedUser.user.id, role: decodedUser.user.role });
            } catch (error) {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const handleAuthSuccess = (data) => {
        const decodedUser = jwtDecode(data.token);
        setUser({ id: decodedUser.user.id, role: decodedUser.user.role });
        navigate('/inicio');
    };

    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: (data) => {
            setIsNewRegistration(false);
            handleAuthSuccess(data);
            toast.success('¡Bienvenido/a de nuevo!');
        },
    });

    const registerMutation = useMutation({
        mutationFn: authService.register,
        onSuccess: (data) => {
            setIsNewRegistration(true);
            handleAuthSuccess(data);
            toast.success('¡Registro exitoso! Bienvenido/a.');
        },
    });

    const googleLoginMutation = useMutation({
        mutationFn: authService.loginWithGoogle,
        onSuccess: (data) => {
            setIsNewRegistration(false);
            handleAuthSuccess(data);
            toast.success('¡Bienvenido/a a través de Google!');
        },
    });

    const login = (userData) => loginMutation.mutateAsync(userData);
    const register = (userData) => registerMutation.mutateAsync(userData);
    const loginWithGoogle = (googleToken) => googleLoginMutation.mutateAsync(googleToken);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        queryClient.clear();
        navigate('/login');
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        isNewRegistration,
        login,
        register,
        loginWithGoogle,
        logout,
        isLoginLoading: loginMutation.isPending,
        isRegisterLoading: registerMutation.isPending,
        isGoogleLoginLoading: googleLoginMutation.isPending,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;