// src/pages/ResultsHistoryPage.js

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import balotarioService from '../services/BalotarioService';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const ResultsHistoryPage = () => {
    const { 
        data: allResults, 
        isLoading, 
        isError, 
        error 
    } = useQuery({
        queryKey: ['userResultsHistory'],
        queryFn: balotarioService.getUserResults,
    });
    
    // Función de ayuda movida aquí para ser autocontenida
    const formatTime = (totalSeconds) => {
        if (typeof totalSeconds !== 'number') return "N/A";
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`; // Formato más conciso
    };

    if (isLoading) { return <Spinner />; }
    
    if (isError) { return <Alert message={error.message || 'No se pudo cargar tu historial.'} type="error"/>; }

    return (
        <div>
            <h1>Mis Resultados - Historial de Intentos</h1>
            <p>Aquí puedes ver todos los balotarios que has completado. Haz clic en "Ver Revisión" para analizar tu desempeño en detalle.</p>
            
            <div className="history-container">
                {allResults && allResults.length > 0 ? (
                    allResults.map(res => (
                        // Usamos una tarjeta para cada resultado, más moderno que una tabla
                        <div key={res._id} className="result-card">
                            <div className="result-card-header">
                                <h3>{res.balotario ? res.balotario.title : "Balotario de Reforzamiento"}</h3>
                                <span>{new Date(res.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="result-card-body">
                                <div><strong>Puntaje:</strong><span>{res.score.toFixed(2)} / 20.00</span></div>
                                <div><strong>Tiempo:</strong><span>{formatTime(res.timeTakenInSeconds)}</span></div>
                            </div>
                            <div className="result-card-footer">
                                <Link to={`/mis-resultados/${res._id}`} className="button-primary">
                                    Ver Revisión Detallada
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="centered-message">
                        <p>Aún no has completado ningún balotario.</p>
                        <Link to="/balotarios"><button>Empezar ahora</button></Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultsHistoryPage;