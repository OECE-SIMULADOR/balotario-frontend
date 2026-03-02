// src/components/Navbar.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Importaciones necesarias de contextos y librerías
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

// Ya NO necesitamos 'useTimer' aquí

const Navbar = () => {
    // --- LÓGICA DE AUTENTICACIÓN ---
    const { isAuthenticated, logout } = useAuth();
    const [userRole, setUserRole] = useState(null);

    // useEffect para leer el rol del usuario cuando cambia el estado de autenticación
    useEffect(() => {
        if (isAuthenticated) {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    setUserRole(decodedToken.user.role);
                } catch (error) {
                    console.error("No se pudo decodificar el token en Navbar:", error);
                    // Forzar logout si el token está corrupto para evitar un estado inconsistente
                    logout();
                }
            }
        } else {
            setUserRole(null); // Limpiar el rol al cerrar sesión
        }
    }, [isAuthenticated, logout]);


    // --- RENDERIZADO DEL COMPONENTE ---
    // El Navbar ahora solo se preocupa por la navegación y la autenticación.

    // Enlaces para usuarios autenticados
    const authLinks = (
        <ul className="navbar-links">
            {userRole === 'admin' && (
                <li><Link to="/admin/dashboard" className="nav-link admin-link">Panel Admin</Link></li>
            )}
            
            <li><Link to="/balotarios" className="nav-link">Balotarios</Link></li>
            <li><Link to="/mis-resultados" className="nav-link">Mis Resultados</Link></li>
            <li><Link to="/perfil" className="nav-link">Mi Perfil</Link></li>

            {/* Ya no hay ningún temporizador aquí. Vive en <TimerDisplay /> */}
            
            <li>
                <button onClick={logout} className="nav-link logout-btn">
                    Cerrar Sesión
                </button>
            </li>
        </ul>
    );

    // Enlaces para visitantes (no logueados)
    const guestLinks = (
        <ul className="navbar-links">
            <li><Link to="/registro" className="nav-link">Registrarse</Link></li>
            <li><Link to="/login" className="nav-link">Iniciar Sesión</Link></li>
        </ul>
    );

    return (
        <nav className="navbar">
            <Link to={isAuthenticated ? "/inicio" : "/login"} className="navbar-brand">
                <h1>BalotarioApp</h1>
            </Link>
            
            { isAuthenticated ? authLinks : guestLinks }
        </nav>
    );
};

export default Navbar;