// src/pages/DashboardUsuarioPage.js

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import userService from '../services/UserService';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const DashboardUsuarioPage = () => {
    // Usamos useQuery para obtener los datos del perfil del usuario
    const { data: user, isLoading, isError, error } = useQuery({
        queryKey: ['userProfile'], // Clave única para los datos del perfil
        queryFn: userService.getMyProfile // La función que obtiene los datos
    });

    if (isLoading) {
        return <Spinner />;
    }

    if (isError) {
        return <Alert message={error.msg || 'No se pudo cargar la información del usuario.'} type="error" />;
    }

    return (
        <div>
            {/* Saludo personalizado */}
            <div className="welcome-header">
                <h1>¡Hola de nuevo, {user?.name || 'Usuario'}!</h1>
                <p>¿Qué te gustaría hacer hoy?</p>
            </div>

            {/* Tarjetas de navegación */}
            <div className="dashboard-cards">
                <Link to="/balotarios" className="dashboard-card">
                    <h2>Resolver un Balotario</h2>
                    <p>Pon a prueba tus conocimientos y elige un balotario para comenzar.</p>
                </Link>

                <Link to="/mis-resultados" className="dashboard-card">
                    <h2>Ver Mis Resultados</h2>
                    <p>Revisa tu historial, analiza tu desempeño y mira tus estadísticas.</p>
                </Link>

                <Link to="/perfil" className="dashboard-card">
                    <h2>Gestionar Mi Perfil</h2>
                    <p>Actualiza tu información personal y gestiona tu cuenta.</p>
                </Link>
            </div>
        </div>
    );
};

export default DashboardUsuarioPage;