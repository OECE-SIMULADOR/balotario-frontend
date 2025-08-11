// src/components/Spinner.js
import React from 'react';
import './Spinner.css'; // Importaremos un archivo CSS separado para la animación

const Spinner = () => {
    return (
        <div className="spinner-overlay">
            <div className="spinner-container"></div>
        </div>
    );
};

export default Spinner;