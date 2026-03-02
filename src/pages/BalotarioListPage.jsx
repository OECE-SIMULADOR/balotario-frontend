// src/pages/BalotarioListPage.js

import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import balotarioService from '../services/BalotarioService';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const BalotarioListPage = () => {

    // --- Query 1: Para la lista de balotarios normales ---
    const { 
        data: balotarios, 
        isLoading: isLoadingList, // Renombramos para evitar conflictos
        isError: isListError,
        error: listError
    } = useQuery({ 
        queryKey: ['balotariosPublicList'],
        queryFn: balotarioService.getBalotariosList,
    });
    
    // --- Query 2: Para el balotario de reforzamiento ---
    const { 
        data: reinforcementQuestions, 
        isLoading: isLoadingReinforcement
    } = useQuery({ 
        queryKey: ['reinforcementBalotario'],
        queryFn: balotarioService.getReinforcementBalotario,
        // No necesita 'isError' porque un array vacío no es un error
    });

    // Mostramos un spinner si CUALQUIERA de las dos peticiones está cargando
    if (isLoadingList || isLoadingReinforcement) {
        return <Spinner />;
    }

    // Mostramos un error si la petición principal de la lista falla
    if (isListError) {
        return <Alert message={listError.message || 'No se pudo cargar la lista.'} type="error" />;
    }

    return (
        <div>
            <h1>Selecciona un Balotario para Resolver</h1>
            
            {/* --- >>> TARJETA ESPECIAL DE REFORZAMIENTO <<< --- */}
            {/* Solo se muestra si la API devuelve preguntas de reforzamiento */}
            {reinforcementQuestions && reinforcementQuestions.length > 0 && (
                <div className="question-block" style={{border: '2px solid #1877f2', backgroundColor: '#e7f3ff'}}>
                    <h2>✨ Mi Balotario de Reforzamiento ✨</h2>
                    <p>
                        Este es un balotario especial con <strong>{reinforcementQuestions.length} preguntas</strong> seleccionadas de tus intentos anteriores para que puedas reforzar tus conocimientos.
                    </p>
                    {/* El enlace usa un ID "virtual" ('reforzamiento') que el BalotarioPage sabrá interpretar */}
                    <Link to={`/balotario/reforzamiento`}>
                        <button>Resolver Reforzamiento</button>
                    </Link>
                </div>
            )}
            {/* ---------------------------------------------------- */}

            {balotarios && balotarios.map(balotario => (
                <div key={balotario._id} className="question-block">
                    <h2>{balotario.title}</h2>
                    <p>{balotario.description}</p>
                    <Link to={`/balotario/${balotario._id}`}>
                        <button>Resolver este Balotario</button>
                    </Link>
                </div>
            ))}

            {/* Mensaje si no hay NINGÚN balotario de ningún tipo */}
            {(!balotarios || balotarios.length === 0) && (!reinforcementQuestions || reinforcementQuestions.length === 0) && (
                <div className="centered-message">
                    <p>No hay balotarios disponibles por el momento.</p>
                </div>
            )}
        </div>
    );
};

export default BalotarioListPage;