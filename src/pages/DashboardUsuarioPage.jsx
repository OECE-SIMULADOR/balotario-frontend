import React from 'react';
import { useQuery } from '@tanstack/react-query';
import userService from '../services/UserService';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const DashboardUsuarioPage = () => {
    // 1. Usamos useQuery para obtener los datos COMPLETOS del perfil
    const { 
        data: userProfile, 
        isLoading, 
        isError, 
        error 
    } = useQuery({
        queryKey: ['userProfile'],
        queryFn: userService.getMyProfile
    });

    // 2. Manejamos los estados de carga y error
    if (isLoading) {
        return <Spinner />;
    }
    
    if (isError || !userProfile) {
        return <Alert message={error?.msg || 'No se pudo cargar tu información de perfil.'} type="error" />;
    }

    // 3. LA LÓGICA DE BIENVENIDA CORRECTA
    // Ahora podemos confiar en que userProfile.resultsCount existe
    const isNewUser = userProfile.resultsCount === 0;

    return (
        <div>
            <div className="welcome-header">
                {/* Y el nombre ahora se lee de userProfile.user.name */}
                <h1>
                    {isNewUser ? '¡Bienvenido/a, ' : '¡Hola de nuevo, '}
                    {userProfile.user ? userProfile.user.name : 'Compañero'}!
                </h1>
                <p>¿Qué te gustaría hacer hoy?</p>
            </div>
            
            {/* El resto del JSX no cambia */}
            <div className="dashboard-cards">
                 <Link to="/balotarios" className="dashboard-card">
                    <h2>Resolver un Balotario</h2>
                    <p>Pon a prueba tus conocimientos y elige un balotario.</p>
                </Link>
                <Link to="/mis-resultados" className="dashboard-card">
                    <h2>Ver Mis Resultados</h2>
                    <p>Revisa tu historial, analiza tu desempeño y tus estadísticas.</p>
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