// src/pages/PerfilPage.js

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import userService from '../services/UserService';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const PerfilPage = () => {
    // Usamos useQuery para obtener los datos del perfil.
    // 'queryKey: ['userProfile']' es la misma que usamos en DashboardUsuarioPage.
    // React Query será inteligente y, si los datos ya están en caché, los mostrará
    // instantáneamente mientras verifica si hay actualizaciones.
    const { data: user, isLoading, isError, error } = useQuery({
        queryKey: ['userProfile'],
        queryFn: userService.getMyProfile
    });

    if (isLoading) {
        return <Spinner />;
    }

    if (isError) {
        return <Alert message={error.msg || 'No se pudo cargar tu perfil.'} type="error" />;
    }

    return (
        <div>
            <div className="form-header">
                <h1>Mi Perfil</h1>
            </div>
            <div className="admin-form"> {/* Reutilizamos los estilos del formulario de admin */}
                <div className="form-group">
                    <label>Nombre Completo</label>
                    {/* Hacemos el input de solo lectura (readOnly) */}
                    <input type="text" value={user?.name || ''} readOnly />
                </div>
                <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" value={user?.email || ''} readOnly />
                </div>
                <div className="form-group">
                    <label>Rol de Usuario</label>
                    <input type="text" value={user?.role === 'admin' ? 'Administrador' : 'Usuario Estándar'} readOnly />
                </div>
                {/* Futuro botón para editar perfil
                <div className="form-actions">
                    <button>Editar Perfil</button>
                </div>
                */}
            </div>
        </div>
    );
};

export default PerfilPage;