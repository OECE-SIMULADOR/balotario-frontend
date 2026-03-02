// src/services/AdminService.js
import api from '../utils/api';

// ===================================
// === SERVICIOS PARA LOS BALOTARIOS ===
// ===================================

const getAllBalotarios = async () => {
    try {
        const res = await api.get('/admin/balotarios');
        return res.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error de red al obtener balotarios');
    }
};

const getBalotarioById = async (id) => {
    try {
        const res = await api.get(`/admin/balotarios/${id}`);
        return res.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error de red');
    }
};

const createBalotario = async (balotarioData) => {
    try {
        const res = await api.post('/admin/balotarios', balotarioData);
        return res.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error de red');
    }
};

const updateBalotario = async (id, balotarioData) => {
    try {
        const res = await api.put(`/admin/balotarios/${id}`, balotarioData);
        return res.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error de red');
    }
};

const deleteBalotario = async (id) => {
    try {
        const res = await api.delete(`/admin/balotarios/${id}`);
        return res.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error de red');
    }
};


// ====================================
// ===   SERVICIOS PARA LAS PREGUNTAS ===
// ====================================

const getQuestionsForBalotario = async (balotarioId) => {
    try {
        const res = await api.get(`/admin/balotarios/${balotarioId}/questions`);
        return res.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error de red');
    }
};

const getQuestionById = async (questionId) => {
    try {
        const res = await api.get(`/admin/questions/${questionId}`);
        return res.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error de red');
    }
};

const addQuestionToBalotario = async (balotarioId, questionData) => {
    try {
        const res = await api.post(`/admin/balotarios/${balotarioId}/questions`, questionData);
        return res.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error de red');
    }
};

const updateQuestion = async (questionId, questionData) => {
    try {
        const res = await api.put(`/admin/questions/${questionId}`, questionData);
        return res.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error de red');
    }
};

const deleteQuestion = async (questionId) => {
    try {
        const res = await api.delete(`/admin/questions/${questionId}`);
        return res.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error de red');
    }
};


// ==========================================
// === SERVICIOS PARA IMPORTACIÓN MASIVA  ===
// ==========================================

const importFullBalotario = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        // --- >> MODIFICACIÓN CLAVE PARA ASEGURAR COMPATIBILIDAD << ---
        // Se añade un objeto de configuración para especificar manualmente la cabecera.
        // Esto ayuda a resolver problemas de `busboy` y `Unexpected end of form`.
        const res = await api.post('/admin/import-full-balotario', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return res.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Error de red al importar archivo.');
    }
};

const adminService = {
    // Balotarios
    getAllBalotarios,
    getBalotarioById,
    createBalotario,
    updateBalotario,
    deleteBalotario,
    // Preguntas
    getQuestionsForBalotario,
    getQuestionById,
    addQuestionToBalotario,
    updateQuestion,
    deleteQuestion,
    importFullBalotario,
};

export default adminService;