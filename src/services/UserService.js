// src/services/UserService.js
import api from '../utils/api';

/**
 * Obtiene los datos del perfil del usuario actualmente autenticado.
 * @returns {Promise<Object>} El objeto del usuario (sin contraseña).
 */
const getMyProfile = async () => {
    try {
        const res = await api.get('/usuarios/me');
        return res.data;
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error.response.data);
        throw error.response.data;
    }
};

const userService = {
    getMyProfile,
};

export default userService;