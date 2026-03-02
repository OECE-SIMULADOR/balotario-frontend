// src/pages/QuestionFormPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import adminService from '../services/AdminService';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

// Lista de categorías centralizada para evitar repetición
const categories = [
    'Principios y Marco Normativo General',
    'Actores del Proceso de Contratación',
    'Planificación y Actuaciones Preparatorias',
    'Procedimientos de Selección',
    'Ejecución Contractual',
    'Solución de Controversias',
    'Régimen de Infracciones y Sanciones',
    'Herramientas Digitales y Registros',
    'Disposiciones Específicas por Objeto de Contratación'
];

const QuestionFormPage = () => {
    const { balotarioId, questionId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(questionId);

    const initialFormData = {
        questionNumber: 1, questionText: '', questionType: 'Normal',
        options: [{ letter: 'a', text: '' }, { letter: 'b', text: '' }, { letter: 'c', text: '' }, { letter: 'd', text: '' }],
        correctAnswer: 'a', feedback: '',
        category: categories[0]
    };
    
    // --- LÓGICA DE PERSISTENCIA: Paso 1 - Clave y Carga Inicial ---
    // Creamos una clave única en localStorage para no mezclar datos de diferentes formularios
    const storageKey = isEditMode ? `edit_question_${questionId}` : `create_question_${balotarioId}`;
    
    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem(storageKey);
        // Si encontramos datos guardados, los usamos; si no, usamos el estado inicial.
        return savedData ? JSON.parse(savedData) : initialFormData;
    });

    // Otros estados para la UI
    const [loading, setLoading] = useState(isEditMode);
    const [error, setError] = useState('');
    
    // useEffect para cargar datos frescos de la API en modo edición
    useEffect(() => {
        if (isEditMode && questionId) {
            setLoading(true);
            adminService.getQuestionById(questionId)
                .then(data => {
                    // Sobrescribimos el estado con los datos de la base de datos,
                    // que son la "fuente de la verdad".
                    setFormData(data);
                })
                .catch(err => {
                    console.error(err);
                    setError("No se pudo cargar la pregunta para editar.");
                })
                .finally(() => setLoading(false));
        }
    }, [questionId, isEditMode]);
    
    // --- LÓGICA DE PERSISTENCIA: Paso 2 - Guardado Automático ---
    // Este useEffect se activa cada vez que el contenido del formulario (formData) cambia.
    useEffect(() => {
        // Guardamos la versión más reciente de los datos del formulario en localStorage.
        localStorage.setItem(storageKey, JSON.stringify(formData));
    }, [formData, storageKey]);

    // Manejadores de eventos del formulario
    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleOptionChange = (index, value) => {
        const newOptions = formData.options.map((opt, i) => i === index ? { ...opt, text: value } : opt);
        setFormData({ ...formData, options: newOptions });
    };
    
    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isEditMode) {
                // Preparamos los datos, quitando campos que MongoDB añade y no queremos reenviar.
                const { _id, balotario, __v, ...dataToUpdate } = formData;
                await adminService.updateQuestion(questionId, dataToUpdate);
                toast.success('Pregunta actualizada con éxito!');
            } else {
                await adminService.addQuestionToBalotario(balotarioId, formData);
                toast.success('Pregunta creada con éxito');
            }

            // --- LÓGICA DE PERSISTENCIA: Paso 3 - Limpieza Final ---
            // Después de un guardado exitoso, limpiamos los datos temporales.
            localStorage.removeItem(storageKey);

            navigate(`/admin/balotarios/${balotarioId || formData.balotario}/preguntas`);
        } catch (error) {
            setError(error.msg || 'Error al guardar la pregunta.');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading && isEditMode) return <Spinner />;

    // --- RENDERIZADO VISUAL COMPLETO DEL FORMULARIO ---
    // En QuestionFormPage.js, reemplaza el 'return' completo

return (
    <div>
        <div className="form-header">
            <h2>{isEditMode ? 'Editar Pregunta' : `Añadir Pregunta`}</h2>
            <Link to={`/admin/balotarios/${balotarioId}/preguntas`} className="back-link">
                &larr; Volver a la lista de preguntas
            </Link>
        </div>

        <Alert message={error} type="error" />
        
        <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="questionNumber">Número de Pregunta</label>
                    <input id="questionNumber" name="questionNumber" type="number" value={formData.questionNumber} onChange={handleChange} min="1" required/>
                </div>
                <div className="form-group">
                    <label htmlFor="questionType">Tipo de Pregunta</label>
                    <select id="questionType" name="questionType" value={formData.questionType} onChange={handleChange}>
                        <option value="Normal">Normal</option>
                        <option value="Marque la CORRECTA">Marque la CORRECTA</option>
                        <option value="Marque la INCORRECTA">Marque la INCORRECTA</option>
                    </select>
                </div>
            </div>
            
            <div className="form-group">
                <label htmlFor="questionText">Texto de la Pregunta</label>
                <textarea id="questionText" name="questionText" value={formData.questionText} onChange={handleChange} rows="3" required/>
            </div>
            
            <h3 className="form-section-title">Opciones de Respuesta</h3>
            {formData.options.map((opt, index) => (
                <div className="form-group form-option" key={index}>
                    <label htmlFor={`option-${opt.letter}`}>Opción {opt.letter.toUpperCase()}:</label>
                    <input id={`option-${opt.letter}`} type="text" value={opt.text} onChange={e => handleOptionChange(index, e.target.value)} required/>
                </div>
            ))}

            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="correctAnswer">Respuesta Correcta</label>
                    <select id="correctAnswer" name="correctAnswer" value={formData.correctAnswer} onChange={handleChange}>
                        {formData.options.map(opt => <option key={opt.letter} value={opt.letter}>Opción {opt.letter.toUpperCase()}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="category">Categoría (para Radar Chart)</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            
            <div className="form-group">
                <label htmlFor="feedback">Feedback / Explicación</label>
                <textarea id="feedback" name="feedback" value={formData.feedback} onChange={handleChange} rows="4" required/>
            </div>
            
            <div className="form-actions">
                <button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : (isEditMode ? 'Actualizar Pregunta' : 'Crear Pregunta')}
                </button>
            </div>
        </form>
    </div>
);
};

export default QuestionFormPage;