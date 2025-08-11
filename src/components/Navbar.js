// src/components/Navbar.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Importamos el hook de autenticación
import { useAuth } from '../context/AuthContext';
// La librería para decodificar el token JWT
import { jwtDecode } from 'jwt-decode';

// Ya no necesitamos 'useTimer' aquí

const Navbar = () => {
    // --- LÓGICA DE AUTENTICACIÓN ---
    const { isAuthenticated, logout } = useAuth();
    
    // Estado local para almacenar el rol del usuario (admin o user)
    const [userRole, setUserRole] = useState(null);

    // useEffect se activa cuando el estado de autenticación cambia
    useEffect(() => {
        if (isAuthenticated) {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Decodificamos el token para leer el rol
                    const decodedToken = jwtDecode(token);
                    setUserRole(decodedToken.user.role);
                } catch (error) {
                    console.error("No se pudo decodificar el token en Navbar:", error);
                    // Si el token es inválido, limpiamos el rol y forzamos un logout para evitar estados inconsistentes
                    logout(); 
                    setUserRole(null);
                }
            }
        } else {
            // Si el usuario no está autenticado, no hay rol
            setUserRole(null);
        }
    }, [isAuthenticated, logout]);

    // ...continuación de Navbar.js

    // --- RENDERIZADO DEL COMPONENTE ---

    // Definimos el bloque de enlaces para un usuario que HA INICIADO SESIÓN
    const authLinks = (
        <ul className="navbar-links">
            {/* Renderizado condicional: El enlace a "Panel Admin" solo se muestra si el rol es 'admin' */}
            {userRole === 'admin' && (
                <li><Link to="/admin/dashboard" className="nav-link admin-link">Panel Admin</Link></li>
            )}
            
            <li><Link to="/balotarios" className="nav-link">Balotarios</Link></li>
            <li><Link to="/mis-resultados" className="nav-link">Mis Resultados</Link></li>
            <li><Link to="/perfil" className="nav-link">Mi Perfil</Link></li>

            {/* Ya no hay ningún temporizador aquí */}
            
            <li>
                <button onClick={logout} className="nav-link logout-btn">
                    Cerrar Sesión
                </button>
            </li>
        </ul>
    );

    // Definimos el bloque de enlaces para un usuario INVITADO (no logueado)
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
            
            {/* Decidimos qué bloque de enlaces mostrar según el estado de autenticación */}
            { isAuthenticated ? authLinks : guestLinks }
        </nav>
    );
};

export default Navbar;