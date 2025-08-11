import axios from 'axios';

const api = axios.create({
  baseURL: 'https://oece-balotarios.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers['x-auth-token'] = token;
    return config;
});

// >>>>> INTERCEPTOR DE RESPUESTAS MEJORADO <<<<<
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // 401 Unauthorized - el token es inválido/expirado
      // Borramos el token y recargamos la página.
      // La lógica de PrivateRoute hará la redirección al login.
      localStorage.removeItem('token');
      // No necesitamos llamar a logout() aquí, para evitar bucles.
      // Simplemente eliminamos la sesión local y dejamos que la app reaccione.
      window.location.href = '/login'; // Redirección forzada
    }
    return Promise.reject(err);
  }
);

export default api;