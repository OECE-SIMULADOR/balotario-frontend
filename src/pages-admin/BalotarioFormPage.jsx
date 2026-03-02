// src/pages/BalotarioFormPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import adminService from '../services/AdminService';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { toast } from 'react-toastify';

const BalotarioFormPage = () => {
    // Hooks
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    // --- LÓGICA DE PERSISTENCIA: Paso 1 - Clave y Carga Inicial ---
    // Clave dinámica para distinguir entre crear un nuevo balotario y editar uno existente
    const storageKey = isEditMode ? `edit_balotario_${id}` : 'create_balotario_draft';

    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem(storageKey);
        // Si hay un borrador guardado en localStorage, lo usamos. Si no, estado inicial.
        return savedData ? JSON.parse(savedData) : { title: '', description: '' };
    });

    const [loading, setLoading] = useState(isEditMode);
    const [pageTitle, setPageTitle] = useState('Crear Nuevo Balotario');
    const [error, setError] = useState('');
    
    // useEffect para cargar los datos desde la API si estamos editando
    useEffect(() => {
        if (isEditMode) {
            setPageTitle('Editar Balotario');
            setLoading(true);
            const fetchBalotarioData = async () => {
                try {
                    const data = await adminService.getBalotarioById(id);
                    setFormData({ title: data.title, description: data.description });
                } catch (error) {
                    setError('No se pudo cargar el balotario para editar.');
                } finally {
                    setLoading(false);
                }
            };
            fetchBalotarioData();
        }
    }, [id, isEditMode]);
    
    // --- LÓGICA DE PERSISTENCIA: Paso 2 - Guardado Automático ---
    // Este useEffect guarda los cambios del formulario en tiempo real
    useEffect(() => {
        // Solo guardamos si hay algo escrito para no llenar localStorage con borradores vacíos
        if (formData.title || formData.description) {
            localStorage.setItem(storageKey, JSON.stringify(formData));
        }
    }, [formData, storageKey]);


    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isEditMode) {
                await adminService.updateBalotario(id, formData);
                toast.success('¡Balotario actualizado con éxito!');
            } else {
                await adminService.createBalotario(formData);
                toast.success('¡Balotario creado con éxito!');
            }
            
            // --- LÓGICA DE PERSISTENCIA: Paso 3 - Limpieza Final ---
            // Una vez que la operación es exitosa, eliminamos el borrador
            localStorage.removeItem(storageKey);

            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.msg || 'Ocurrió un error al guardar el balotario.');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading && isEditMode) {
        return <Spinner />;
    }

    // --- RENDERIZADO DEL FORMULARIO (VISUALMENTE NO CAMBIA) ---
    return (
        <div>
            <div className="form-header">
                <h2>{pageTitle}</h2>
                <Link to="/admin/dashboard" className="back-link">
                    &larr; Volver al Panel de Administración
                </Link>
            </div>
            
            <Alert message={error} type="error" />
            
            <form onSubmit={onSubmit} className="admin-form">
    <div className="form-group">
        <label htmlFor="title">Título del Balotario</label>
        {/* Asegúrate de que 'value' esté vinculado a formData.title */}
        <input
            type="text"
            name="title"
            id="title"
            value={formData.title} 
            onChange={onChange}
            required
        />
    </div>
    <div className="form-group">
        <label htmlFor="description">Descripción</label>
        {/* Asegúrate de que 'value' esté vinculado a formData.description */}
        <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={onChange}
            required
            rows="5"
        ></textarea>
    </div>
                <div className="form-actions">
                    <button type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : (isEditMode ? 'Actualizar Balotario' : 'Crear Balotario')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BalotarioFormPage;