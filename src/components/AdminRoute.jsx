import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = () => {
    // 'user' ha sido removido porque no se usaba.
    const { isAuthenticated, loading } = useAuth(); 
    const token = localStorage.getItem('token');

    if (loading) {
        return <div>Verificando permisos de administrador...</div>;
    }

    if (!isAuthenticated || !token) {
        return <Navigate to="/login" />;
    }

    try {
        const decoded = jwtDecode(token);
        if (decoded.user && decoded.user.role === 'admin') {
            return <Outlet />;
        } else {
            return <Navigate to="/balotarios" replace />;
        }
    } catch (error) {
        return <Navigate to="/login" />;
    }
};

export default AdminRoute;