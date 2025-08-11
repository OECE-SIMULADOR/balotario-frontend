// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';

// CONTEXTOS
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';

// COMPONENTES DE ESTRUCTURA Y RUTA
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import TimerDisplay from './components/TimerDisplay';
// PÁGINAS DE USUARIO
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardUsuarioPage from './pages/DashboardUsuarioPage';
import PerfilPage from './pages/PerfilPage';
import BalotarioListPage from './pages/BalotarioListPage';
import BalotarioPage from './pages/BalotarioPage';
import ResultsHistoryPage from './pages/ResultsHistoryPage';
import DashboardPage from './pages/DashboardPage';

// PÁGINAS DE ADMINISTRACIÓN
import AdminDashboardPage from './pages-admin/AdminDashboardPage';
import BalotarioFormPage from './pages-admin/BalotarioFormPage';
import QuestionManagementPage from './pages-admin/QuestionManagementPage';
import QuestionFormPage from './pages-admin/QuestionFormPage';

// HERRAMIENTAS Y ESTILOS
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './App.css';

// Instancia de React Query Client con configuración global
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

// ...continuación de App.js

function App() {
  return (
    // Proveedor de React Query
    <QueryClientProvider client={queryClient}>
      {/* Proveedor de React Router */}
      <Router>
        {/* Proveedor de Temporizador */}
        <TimerProvider>
          {/* Proveedor de Autenticación */}
          <AuthProvider>

            <Navbar />
             <TimerDisplay /> 
            {/* ------------------------------------------- */}

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <div className="App">
              <Routes>
                {/* --- RUTAS PÚBLICAS --- */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegisterPage />} />


                {/* --- RUTAS PRIVADAS (PARA TODOS LOS USUARIOS AUTENTICADOS) --- */}
                <Route element={<PrivateRoute />}>
                  <Route path="/inicio" element={<DashboardUsuarioPage />} />
                  <Route path="/perfil" element={<PerfilPage />} />
                  <Route path="/balotarios" element={<BalotarioListPage />} />
                  <Route path="/balotario/:balotarioId" element={<BalotarioPage />} />
                  
                  {/* --- Rutas de Resultados, correctamente ubicadas aquí --- */}
                  <Route path="/mis-resultados" element={<ResultsHistoryPage />} />
                  <Route path="/mis-resultados/:resultId" element={<DashboardPage />} />
                </Route>


                {/* --- RUTAS DE ADMINISTRACIÓN (SOLO PARA ADMINS) --- */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/balotarios/nuevo" element={<BalotarioFormPage />} />
                  <Route path="/admin/balotarios/editar/:id" element={<BalotarioFormPage />} />
                  <Route path="/admin/balotarios/:balotarioId/preguntas" element={<QuestionManagementPage />} />
                  <Route path="/admin/balotarios/:balotarioId/preguntas/nuevo" element={<QuestionFormPage />} />
                  <Route path="/admin/questions/editar/:questionId" element={<QuestionFormPage />} />
                </Route>

                
                {/* --- RUTA 404 (Catch-All) --- */}
                <Route path="*" element={
                  <div className="centered-message">
                    <h2>404 - Página No Encontrada</h2>
                    <Link to="/"><button>Volver a la Página de Inicio</button></Link>
                  </div>
                } />
              </Routes>
            </div>

          </AuthProvider>
        </TimerProvider>
      </Router>

      {/* Herramientas de depuración para React Query (solo visibles en desarrollo) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;