// src/components/Alert.js
import React from 'react';

const Alert = ({ message, type = 'error' }) => {
    // Definimos estilos base y estilos específicos para cada tipo de alerta
    const baseStyle = {
        padding: '12px 15px',
        margin: '15px 0',
        border: '1px solid',
        borderRadius: '6px',
        textAlign: 'center',
        fontWeight: 'bold'
    };

    const alertStyles = {
        error: {
            color: '#721c24',
            backgroundColor: '#f8d7da',
            borderColor: '#f5c6cb'
        },
        success: {
            color: '#155724',
            backgroundColor: '#d4edda',
            borderColor: '#c3e6cb'
        }
    };

    // Fusionamos los estilos base con el estilo específico del tipo de alerta
    const finalStyle = { ...baseStyle, ...alertStyles[type] };

    // Si no hay mensaje, no renderizamos nada
    if (!message) {
        return null;
    }

    return (
        <div style={finalStyle}>
            {message}
        </div>
    );
};

export default Alert;