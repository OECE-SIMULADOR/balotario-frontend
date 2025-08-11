// src/services/BalotarioService.js
import api from '../utils/api';

/**
 * Obtiene la lista de todos los balotarios disponibles para los usuarios.
 * @returns {Promise<Array>} Un array de balotarios.
 */
const getBalotariosList = async () => {
    try {
        const res = await api.get('/balotarios'); 
        return res.data;
    } catch (error) {
        console.error('Error en servicio getBalotariosList:', error.response ? error.response.data : error);
        throw error.response ? error.response.data : error;
    }
};

/**
 * Obtiene las preguntas para resolver un balotario.
 * Llama a una ruta segura que OCULTA la respuesta correcta y el feedback.
 * @param {string} balotarioId - El ID del balotario.
 * @returns {Promise<Array>} Un array de preguntas sin datos sensibles.
 */
const getQuestions = async (balotarioId) => {
    try {
        const res = await api.get(`/balotarios/${balotarioId}/questions`);
        return res.data;
    } catch (error) {
        console.error('Error en servicio getQuestions:', error.response ? error.response.data : error);
        throw error.response ? error.response.data : error;
    }
};

/**
 * Envía las respuestas para evaluación.
 * @param {object} answers - Las respuestas del usuario.
 * @param {string} balotarioId - El ID del balotario.
 * @returns {Promise<object>} El resultado del intento.
 */
const evaluateAnswers = async (answersData, balotarioIdData, timeData) => {
    try {
        // Creamos un objeto 'body' claro y explícito.
        // Las claves aquí (answers, balotarioId, timeTakenInSeconds) deben
        // coincidir EXACTAMENTE con las que el backend espera en req.body.
        const body = {
            answers: answersData,
            balotarioId: balotarioIdData,
            timeTakenInSeconds: timeData
        };

        console.log('[BalotarioService] Enviando este body para evaluar:', body); // Añadimos log aquí

        const res = await api.post('/balotarios/evaluar', body);
        return res.data;
        
    } catch (error) {
        console.error('Error en servicio evaluateAnswers:', error.response ? error.response.data : error);
        throw error.response ? error.response.data : error;
    }
};

/**
 * Obtiene el historial de resultados del usuario logueado.
 * @returns {Promise<Array>} El historial de intentos.
 */
const getUserResults = async () => {
    try {
        const res = await api.get('/resultados'); 
        return res.data;
    } catch (error) {
        console.error('Error en servicio getUserResults:', error);
        throw error.response ? error.response.data : error;
    }
};

// ...continuación de BalotarioService.js

/**
 * Obtiene las preguntas COMPLETAS para la página de revisión.
 * Llama a una ruta que SÍ INCLUYE la respuesta correcta y el feedback.
 * @param {string} balotarioId - El ID del balotario.
 * @returns {Promise<Array>} Un array de preguntas con todos los datos.
 */
const getQuestionsForReview = async (balotarioId) => {
    try {
        // Llama a la nueva ruta /review que creamos en el backend
        const res = await api.get(`/balotarios/${balotarioId}/review`);
        return res.data;
    } catch (error) { 
        // --- >> EL BLOQUE CATCH QUE FALTABA << ---
        console.error('Error en servicio getQuestionsForReview:', error.response ? error.response.data : error);
        throw error.response ? error.response.data : error;
    }
};

const getReinforcementBalotario = async () => {
    try {
        const res = await api.get('/balotarios/reforzamiento');
        return res.data;
    } catch(error){ /* ... */ }
};


// Agrupamos todas las funciones del servicio en un solo objeto para exportarlo.
// Nos aseguramos de que no falte ninguna coma.
const balotarioService = { 
    getBalotariosList, 
    getQuestions, 
    evaluateAnswers,
    getUserResults,
    getQuestionsForReview, // Incluimos la nueva función
    getReinforcementBalotario
};

export default balotarioService;