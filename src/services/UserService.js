// src/services/UserService.js
import api from '../utils/api';

// Exportamos cada función directamente. Es una práctica más clara.
export const getMyProfile = async () => {
    try {
        const res = await api.get('/usuarios/me');
        return res.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

const userService = {
  getMyProfile,
};

// Mantenemos la exportación por defecto para no romper otros archivos.
export default userService;