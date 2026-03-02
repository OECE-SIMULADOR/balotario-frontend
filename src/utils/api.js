// src/utils/api.js (o src/api.js)
import axios from 'axios';

// 1. Usar import.meta.env para Vite
// Si no encuentra la variable, usa la URL hardcodeada como respaldo de seguridad
const baseURL = import.meta.env.VITE_API_URL || 'https://oece-balotarios.onrender.com/api';

const api = axios.create({
  baseURL: baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers['x-auth-token'] = token;
    return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("Error en la petición API:", err); // Agrega este log para ver errores en consola
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;