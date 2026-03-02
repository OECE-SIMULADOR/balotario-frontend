// src/pages/DashboardPage.js

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import balotarioService from '../services/BalotarioService';

// Componentes
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Review from '../components/Review';

// Librería de gráficos
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);


const DashboardPage = () => {
    // Estados del componente
    const [allResults, setAllResults] = useState([]);
    const [currentResult, setCurrentResult] = useState(null);
    const [reviewQuestions, setReviewQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { resultId } = useParams();

    // --- FUNCIÓN DE AYUDA PARA FORMATEAR EL TIEMPO ---
    // La definimos aquí para poder usarla en esta página.
    const formatTime = (totalSeconds) => {
        if (typeof totalSeconds !== 'number' || totalSeconds < 0) return "00:00";
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${secs}`;
    };

    // useEffect para cargar todos los datos necesarios para el dashboard
    useEffect(() => {
        const fetchAllDashboardData = async () => {
            setLoading(true);
            setError('');
            try {
                const allUserResults = await balotarioService.getUserResults();
                if (!allUserResults || allUserResults.length === 0) {
                    throw new Error("Aún no tienes resultados guardados. ¡Completa un balotario!");
                }
                setAllResults(allUserResults);
                
                const resultToShow = resultId === 'latest' ? allUserResults[0] : allUserResults.find(r => r._id === resultId);
                if (!resultToShow) throw new Error("No se pudo encontrar el resultado que buscas.");
                
                setCurrentResult(resultToShow);

                if (resultToShow.balotario && resultToShow.balotario._id) {
                    const questionsData = await balotarioService.getQuestionsForReview(resultToShow.balotario._id);
                    setReviewQuestions(questionsData);
                } else {
                    throw new Error("El resultado no tiene información de balotario asociada.");
                }

            } catch (err) {
                console.error('Error al cargar datos del dashboard:', err);
                setError(err.message || 'No se pudieron cargar los datos.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllDashboardData();
    }, [resultId]);

    // ...continuación de DashboardPage.js

    // --- RENDERIZADO CONDICIONAL ---
    if (loading) {
        return <Spinner />;
    }
    if (error && !currentResult) {
        return <Alert message={error} type="error" />;
    }
    if (!currentResult) {
        return <div className="centered-message">No se encontraron resultados para mostrar.</div>;
    }
    
    // --- PREPARACIÓN DE DATOS PARA EL GRÁFICO ---
    const chartData = {
        labels: Object.keys(currentResult.competencyScores || currentResult.categoryScores),
    datasets: [{
        label: 'Desempeño por Competencia (%)', // Etiqueta actualizada
        data: Object.values(currentResult.competencyScores || currentResult.categoryScores),
            backgroundColor: 'rgba(24, 119, 242, 0.2)',
            borderColor: 'rgba(24, 119, 242, 1)',
            borderWidth: 2,
        }],
    };
    
    // --- RENDERIZADO FINAL DEL COMPONENTE ---
    return (
        <div>
            <h1>Resultados de: {currentResult.balotario?.title || 'Balotario'}</h1>
            
            <div className="dashboard-summary">
                <p>Puntaje Final: <strong>{currentResult.score.toFixed(2)} / 20.00</strong></p>
                <p>Respuestas Correctas: <strong>{currentResult.correctAnswersCount} de {currentResult.totalQuestions}</strong></p>
                {/* Usamos la función formatTime que definimos arriba */}
                <p>Tiempo Empleado: <strong>{formatTime(currentResult.timeTakenInSeconds)}</strong></p>
            </div>
            
            <div className="chart-container">
                <Radar data={chartData} />
            </div>

            <Review 
                details={currentResult.answersDetails} 
                questions={reviewQuestions}
            />
            
            <div className="page-actions">
                <Link to="/mis-resultados"><button>Volver a la Lista de Balotarios</button></Link>
            </div>

            <hr />

            <h2>Mis Resultados: Historial de Intentos</h2>
            <div className="history-table">
                <div className="history-header">
                    <div>Balotario Resuelto</div>
                    <div>Fecha</div>
                    <div>Tiempo</div>
                    <div>Puntaje</div>
                    <div>Acción</div>
                </div>
                {allResults.map(res => (
                    <div key={res._id} className="history-row" style={{gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr'}}>
                        <div><strong>{res.balotario?.title || 'Balotario Desconocido'}</strong></div>
                        <div>{new Date(res.date).toLocaleDateString('es-ES')}</div>
                        <div style={{textAlign: 'center'}}><strong>{formatTime(res.timeTakenInSeconds)}</strong></div>
                        <div style={{textAlign: 'center'}}><strong>{res.score.toFixed(2)} / 20</strong></div>
                        <div style={{textAlign: 'center'}}><Link to={`/dashboard/${res._id}`} className="small-button">Ver Revisión</Link></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardPage;