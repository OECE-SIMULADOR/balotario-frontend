// src/services/authService.js
import api from '../utils/api';

// Función para registrar un usuario
const register = async (userData) => {
    try {
        const res = await api.post('/usuarios/registro', userData);
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
        }
        return res.data;
    } catch (error) {
        console.error('Error en el servicio de registro:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : error;
    }
};

// Función para iniciar sesión
const login = async (userData) => {
    try {
        const res = await api.post('/usuarios/login', userData);
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
        }
        return res.data;
    } catch (error) {
        console.error('Error en el servicio de login:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : error;
    }
};

// --- ESTA ES LA FUNCIÓN QUE FALTABA ---
// Función para iniciar sesión con Google
const loginWithGoogle = async (googleToken) => {
    try {
        // El cuerpo de la petición debe ser un objeto con una clave 'token'
        const body = { token: googleToken };
        
        // Llamamos al nuevo endpoint del backend
        const res = await api.post('/usuarios/google-login', body);

        // Si el backend responde con nuestro propio token, lo guardamos
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
        }
        return res.data;
     } catch (error) {
        console.error('Error en el servicio de login con Google:', error);
        throw error.response ? error.response.data : error;
    }
};
// ------------------------------------

// Objeto que exporta TODAS las funciones del servicio
const authService = {
    register,
    login,
    loginWithGoogle // Ahora 'loginWithGoogle' SÍ está definido.
};

export default authService;