// src/pages/QuestionManagementPage.js
import CSVImporter from '../components/CSVImporter'; // Componente para la subida de archivos
import React from 'react';
import { useParams, Link, } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Herramientas clave para el estado del servidor
import adminService from '../services/AdminService';

// Componentes de UI
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

// Notificaciones
import { toast } from 'react-toastify';

const QuestionManagementPage = () => {
    const { balotarioId } = useParams();
    const queryClient = useQueryClient();

    // --- MANEJO DE DATOS CON REACT QUERY ---

    // 1. Query para obtener los datos del balotario (como su título)
    const { data: balotarioData } = useQuery({
        queryKey: ['balotario', balotarioId],
        queryFn: () => adminService.getBalotarioById(balotarioId)
    });

    // 2. Query principal para obtener la lista de preguntas de este balotario
    const { data: questions, isLoading, isError, error } = useQuery({
        queryKey: ['questions', balotarioId], // La clave depende del balotarioId
        queryFn: () => adminService.getQuestionsForBalotario(balotarioId)
    });

    // --- MUTACIONES (ACCIONES QUE CAMBIAN DATOS) ---

    // 3. Mutación para eliminar una pregunta
    const deleteMutation = useMutation({
        mutationFn: (questionId) => adminService.deleteQuestion(questionId),
        onSuccess: () => {
            toast.success("Pregunta eliminada exitosamente.");
            // Invalidamos la caché de preguntas para forzar una recarga de la lista
            queryClient.invalidateQueries({ queryKey: ['questions', balotarioId] });
        },
        onError: (err) => {
            toast.error(err.msg || "Error al eliminar la pregunta.");
        }
    });

    const handleDeleteQuestion = (questionId, questionText) => {
        if (window.confirm(`¿Seguro que quieres eliminar la pregunta: "${questionText.substring(0, 50)}..."?`)) {
            deleteMutation.mutate(questionId);
        }
    };
    
    // 4. Mutación para la importación de CSV
    const importMutation = useMutation({
        mutationFn: (file) => adminService.importQuestionsFromCSV(balotarioId, file),
        onSuccess: (data) => {
            toast.success(data.msg || 'Archivo procesado. ¡Preguntas importadas!');
            queryClient.invalidateQueries({ queryKey: ['questions', balotarioId] });
        },
        onError: (err) => {
            toast.error(err.msg || 'El archivo no pudo ser importado.');
        }
    });

    const handleFileSelected = (file) => {
        importMutation.mutate(file);
    };


    // --- RENDERIZADO DEL COMPONENTE ---

    if (isLoading) {
        return <Spinner />;
    }

    if (isError) {
        return <Alert message={error.message || "No se pudieron cargar las preguntas."} type="error" />;
    }

    return (
        <div>
            <Link to="/admin/dashboard" className="back-link">
                &larr; Volver al Panel de Administración
            </Link>

            <h1>Gestionar Preguntas para: <em>{balotarioData?.title || 'Balotario'}</em></h1>
            
            <div className="page-actions" style={{display: 'flex', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
                <Link to={`/admin/balotarios/${balotarioId}/preguntas/nuevo`}>
                    <button disabled={importMutation.isPending || deleteMutation.isPending}>+ Añadir Nueva Pregunta</button>
                </Link>
                <CSVImporter
                    onFileSelected={handleFileSelected}
                    isLoading={importMutation.isPending}
                    buttonText="Añadir Preguntas desde CSV"
                />
            </div>

            <div className="history-table">
                <div className="history-header" style={{gridTemplateColumns: '80px 3fr 1fr 1fr'}}>
                    <div>N°</div>
                    <div>Texto de la Pregunta</div>
                    <div style={{textAlign: 'center'}}>Categoría</div>
                    <div style={{textAlign: 'center'}}>Acciones</div>
                </div>
                {questions && questions.length > 0 ? (
                    questions.map((q) => (
                        <div key={q._id} className="history-row" style={{gridTemplateColumns: '80px 3fr 1fr 1fr'}}>
                            <div style={{ textAlign: 'center' }}>{q.questionNumber}</div>
                            <div>{q.questionText.substring(0, 80)}{q.questionText.length > 80 ? '...' : ''}</div>
                            <div style={{ textAlign: 'center', fontSize: '0.85em' }}>{q.category}</div>
                            <div className="action-buttons" style={{flexDirection: 'row', justifyContent: 'center'}}>
                                <Link to={`/admin/questions/editar/${q._id}`} className="small-button">Editar</Link>
                                <button onClick={() => handleDeleteQuestion(q._id, q.questionText)} className="small-button-danger" disabled={deleteMutation.isPending}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="centered-message">Este balotario aún no tiene preguntas.</p>
                )}
            </div>
        </div>
    );
};

export default QuestionManagementPage;