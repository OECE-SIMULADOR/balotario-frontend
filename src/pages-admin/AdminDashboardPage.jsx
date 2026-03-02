// src/pages/AdminDashboardPage.js

import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Herramientas clave
import adminService from '../services/AdminService';

// Componentes de UI
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import CSVImporter from '../components/CSVImporter'; // Nuestro componente de subida de archivos

// Notificaciones
import { toast } from 'react-toastify';

const AdminDashboardPage = () => {
    const queryClient = useQueryClient(); // Para invalidar y recargar datos

    // --- MANEJO DE DATOS CON REACT QUERY ---

    // 1. Query para obtener y mostrar la lista de todos los balotarios.
    const { data: balotarios, isLoading, isError, error } = useQuery({
        queryKey: ['balotarios'], // Clave única para la caché de esta lista
        queryFn: adminService.getAllBalotarios,
    });

    // 2. Mutación para ELIMINAR un balotario.
    const deleteMutation = useMutation({
        mutationFn: (id) => adminService.deleteBalotario(id),
        onSuccess: () => {
            toast.success("Balotario eliminado exitosamente.");
            // Invalidamos la caché de la lista de balotarios para forzar su recarga
            queryClient.invalidateQueries({ queryKey: ['balotarios'] });
        },
        onError: (err) => {
            toast.error(err.msg || "Error al eliminar el balotario.");
        }
    });

    // 3. Mutación para la IMPORTACIÓN MASIVA de un balotario completo.
    const importFullMutation = useMutation({
        mutationFn: (file) => adminService.importFullBalotario(file),
        onSuccess: (data) => {
            toast.success(data.msg || '¡Archivo procesado e importado con éxito!');
            // También invalidamos la lista para que se muestre el nuevo balotario
            queryClient.invalidateQueries({ queryKey: ['balotarios'] });
        },
        onError: (err) => {
            toast.error(err.msg || 'El archivo CSV no pudo ser importado. Revise el formato.');
        }
    });

    // --- MANEJADORES DE EVENTOS ---
    const handleDelete = (id, title) => {
        if (window.confirm(`¿Seguro que quieres eliminar "${title}" y TODAS sus preguntas?`)) {
            deleteMutation.mutate(id);
        }
    };
    
    const handleFullImport = (file) => {
         console.log('[AdminDashboard] handleFullImport llamado con el archivo:', file);
        importFullMutation.mutate(file);
        console.log('[AdminDashboard] Mutación iniciada.');
    };

    // --- RENDERIZADO DEL COMPONENTE ---

    if (isLoading) {
        return <Spinner />;
    }

    if (isError) {
        return <Alert message={error.message || "No se pudieron cargar los balotarios."} type="error" />;
    }

    return (
        <div>
            <div className="form-header">
                <h1>Panel de Administración</h1>
            </div>
            
            <h2 className="form-section-title" style={{ marginTop: '1.5rem', borderTop: 'none', paddingTop: 0 }}>
                Gestionar Balotarios
            </h2>
            
            <Alert message={error} type="error"/>
            
            <div className="page-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <Link to="/admin/balotarios/nuevo">
                    <button disabled={deleteMutation.isPending || importFullMutation.isPending}>
                        + Crear Balotario Manualmente
                    </button>
                </Link>
                {/* Usamos nuestro componente CSVImporter para la nueva funcionalidad */}
                <CSVImporter
                    onFileSelected={handleFullImport}
                    isLoading={importFullMutation.isPending}
                    buttonText="Importar Balotario Completo (CSV)"
                />
            </div>

            <div className="history-table">
                <div className="history-header">
                    <div>Título y Descripción</div>
                    <div style={{ textAlign: 'center' }}>Acciones</div>
                </div>
                {balotarios && balotarios.length > 0 ? (
                    balotarios.map(b => (
                        <div key={b._id} className="history-row admin-row">
                            <div>
                                <strong style={{ fontSize: '1.1em' }}>{b.title}</strong>
                                <p style={{ fontSize: '0.9em', color: '#666', margin: '5px 0 0 0' }}>
                                    {b.description}
                                </p>
                            </div>
                            <div className="action-buttons">
                                <Link to={`/admin/balotarios/${b._id}/preguntas`} className="small-button">
                                    Gestionar Preguntas
                                </Link>
                                <Link to={`/admin/balotarios/editar/${b._id}`} className="small-button">
                                    Editar Balotario
                                </Link>
                                <button 
                                    onClick={() => handleDelete(b._id, b.title)} 
                                    className="small-button-danger"
                                    disabled={deleteMutation.isPending || importFullMutation.isPending}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="centered-message">No se han creado balotarios. ¡Crea uno manualmente o importa un archivo CSV!</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;