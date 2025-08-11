// src/pages/BalotarioPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import balotarioService from '../services/BalotarioService';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { useQueryClient } from '@tanstack/react-query';

const competencyMap = {
    'Principios y Marco Normativo General': 'Competencia : Gestión por Resultados',
    'Actores del Proceso de Contratación': 'Competencia : Actuaciones Preparatorias',
    'Planificación y Actuaciones Preparatorias': 'Competencia : Actuaciones Preparatorias',
    'Herramientas Digitales y Registros': 'Competencia : Actuaciones Preparatorias',
    'Procedimientos de Selección': 'Competencia : Procedimientos de Selección',
    'Ejecución Contractual': 'Competencia : Ejecución Contractual',
    'Solución de Controversias': 'Competencia : Ejecución Contractual',
    'Régimen de Infracciones y Sanciones': 'Competencia : Ejecución Contractual',
    'Disposiciones Específicas por Objeto de Contratación': 'Competencia : Ejecución Contractual',
};

const BalotarioPage = () => {
    // --- ESTADOS ---
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [startTime, setStartTime] = useState(null);
    const queryClient = useQueryClient();
    const [groupedQuestions, setGroupedQuestions] = useState({});
    // --- HOOKS ---
    const { balotarioId } = useParams(); // Puede ser un ID real o la palabra "reforzamiento"
    const navigate = useNavigate();
    const { startTimer, stopTimer, clearTimerForBalotario } = useTimer();

    // useEffect para Cargar Preguntas (ahora con lógica condicional)
    useEffect(() => {
        // Inicializamos los estados para una nueva carga
        setLoading(true);
        setError('');
        setQuestions([]); // Limpia las preguntas anteriores
        setGroupedQuestions({}); // Limpia los grupos anteriores

        // Función asíncrona principal que orquesta toda la carga
        const fetchAndInitialize = async () => {
            // Si no hay un ID de balotario en la URL, no podemos hacer nada.
            if (!balotarioId) {
                setError("No se ha seleccionado ningún balotario.");
                setLoading(false);
                return;
            }

            try {
                // Paso 1: Obtener los datos de las preguntas del backend
                let questionsData;
                if (balotarioId === 'reforzamiento') {
                    // Llama al servicio especial para el balotario adaptativo
                    questionsData = await balotarioService.getReinforcementBalotario();
                } else {
                    // Llama al servicio normal para un balotario estándar
                    questionsData = await balotarioService.getQuestions(balotarioId);
                }
                
                // Verificamos si obtuvimos preguntas
                if (!questionsData || questionsData.length === 0) {
                    throw new Error("Este balotario aún no tiene preguntas cargadas.");
                }
                setQuestions(questionsData); // Guardamos la lista plana original
                
                // --- >>> NUEVA LÓGICA DE AGRUPACIÓN POR COMPETENCIA <<< ---
                const groups = {};
                questionsData.forEach(question => {
                    const competency = competencyMap[question.category] || 'Otras Categorías';
                    if (!groups[competency]) {
                        groups[competency] = []; // Creamos un nuevo array para la competencia
                    }
                    groups[competency].push(question); // Agregamos la pregunta al grupo correcto
                });
                setGroupedQuestions(groups); // Guardamos el objeto de preguntas agrupadas

                // Paso 2: Cargar el progreso de respuestas desde localStorage
                const savedAnswersRaw = localStorage.getItem(`answers_${balotarioId}`);
                if (savedAnswersRaw) {
                    setAnswers(JSON.parse(savedAnswersRaw));
                } else {
                    setAnswers({});
                }

                // Paso 3: Iniciar el temporizador de cuenta regresiva
                const duracionEnMinutos = 120; // Esto puede ser dinámico en el futuro
                stopTimer(); // Detiene cualquier timer previo
                startTimer(balotarioId, duracionEnMinutos * 60);
                setStartTime(Date.now());

            } catch (err) {
                // Si cualquier paso del 'try' falla, se maneja aquí
                console.error('Error al inicializar el balotario:', err);
                setError(err.message || 'Ocurrió un error al cargar la página.');
                stopTimer(); // Nos aseguramos de detener el reloj si hubo un error de carga
            } finally {
                // Este bloque siempre se ejecuta, al final del éxito o el error
                setLoading(false);
            }
        };

        fetchAndInitialize();

        // Función de limpieza del efecto: se ejecuta cuando el usuario sale de esta página
        return () => {
            stopTimer(); // Detiene el temporizador para evitar fugas de memoria
        };
        
    }, [balotarioId, navigate, startTimer, stopTimer]);

    // useEffect para Guardar Progreso
    useEffect(() => {
        if (questions.length > 0 && Object.keys(answers).length > 0) {
            localStorage.setItem(`answers_${balotarioId}`, JSON.stringify(answers));
        }
    }, [answers, balotarioId, questions]);

    // ...continuación de BalotarioPage.js

    // --- MANEJADORES DE EVENTOS ---
    const onAnswerChange = (questionId, optionLetter) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: optionLetter
        }));
    };

    const handleReset = () => {
        if (window.confirm("¿Estás seguro de que quieres borrar tu progreso?")) {
            localStorage.removeItem(`answers_${balotarioId}`);
            setAnswers({});
            // Reinicia el reloj
            const duracion = 120 * 60;
            clearTimerForBalotario(balotarioId);
            startTimer(balotarioId, duracion);
            setStartTime(Date.now());
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        
        // La evaluación del balotario de reforzamiento es igual a la de un balotario normal
        if (Object.keys(answers).length < questions.length) {
            setError('Por favor, responde todas las preguntas para finalizar.');
            return;
        }
        
        setLoading(true);
        stopTimer();

        const endTime = Date.now();
        const timeTakenInSeconds = startTime ? Math.round((endTime - startTime) / 1000) : 0;
        
        try {
            // Pasamos el balotarioId. El backend sabrá si es 'reforzamiento'
            // pero para el resultado no importa, solo para la lógica de aciertos/fallos.
            const result = await balotarioService.evaluateAnswers(answers, balotarioId, timeTakenInSeconds);
            queryClient.invalidateQueries({ queryKey: ['userResultsHistory'] });
            localStorage.removeItem(`answers_${balotarioId}`); 
            clearTimerForBalotario(balotarioId);

            navigate(`/mis-resultados/${result._id}`);
        } catch (err) {
            setError(err.msg || 'Hubo un error al enviar tus respuestas.');
            setLoading(false);
        }
    };

    // --- RENDERIZADO DEL COMPONENTE ---
    if (loading) {
        return <Spinner />;
    }

     return (
        <div>
            {/* ... Título y Alert se mantienen igual ... */}

            {Object.keys(groupedQuestions).length > 0 && !error && (
                <form onSubmit={onSubmit}>
                    {/* Iteramos sobre las competencias (los grupos) */}
                    {Object.entries(groupedQuestions).map(([competencyName, questionsInCompetency]) => (
                        <div key={competencyName} className="competency-section">
                            <h2 className="competency-title">{competencyName}</h2>

                            {/* Iteramos sobre las preguntas dentro de cada competencia */}
                            {questionsInCompetency.map((q, index) => (
                                <div key={q._id} className="question-block">
                                    <p className="question-title">{`${index + 1}. ${q.questionText} (${q.questionType})`}</p>

                                    {/* --- >>>>> ESTE ES EL BLOQUE QUE FALTABA O ESTABA MAL <<< --- */}
                                    <ul className="options-list">
                                        {q.options.map((opt) => (
                                            <li key={opt.letter}>
                                                <input
                                                    type="radio"
                                                    id={`${q._id}-${opt.letter}`}
                                                    name={q._id}
                                                    value={opt.letter}
                                                    onChange={() => onAnswerChange(q._id, opt.letter)}
                                                    checked={answers[q._id] === opt.letter}
                                                />
                                                <label htmlFor={`${q._id}-${opt.letter}`}>
                                                    {`${opt.letter}) ${opt.text}`}
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                    {/* --- ----------------------------------------------- --- */}
                                    
                                    {/* Nueva sub-etiqueta para la categoría granular */}
                                    <div className="question-category-tag">
                                        Categoría: {q.category}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                    {/* Los botones de acción al final, fuera de los bucles */}
                    <div className="form-actions" style={{justifyContent: 'space-between'}}>
                         <button type="button" onClick={handleReset} style={{backgroundColor: '#6c757d'}}>
                            Reiniciar Progreso
                        </button>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Evaluando...' : 'Finalizar y Ver Resultados'}
                        </button>
                    </div>
                </form>
            )}

            {/* ... (mensaje de "no hay preguntas") ... */}
        </div>
    );
};

export default BalotarioPage;