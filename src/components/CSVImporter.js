// src/components/CSVImporter.js

import React, { useRef } from 'react';

// El componente recibe dos props:
// - onFileSelected: La función que se ejecutará cuando se elija un archivo.
// - isLoading: Un booleano para deshabilitar el botón mientras se procesa una subida.
const CSVImporter = ({ onFileSelected, isLoading, buttonText = 'Importar desde CSV' }) => {
    
    // useRef crea una referencia a un elemento del DOM, en este caso, el input de archivo.
    const fileInputRef = useRef(null);

    // Esta función se activa al hacer clic en nuestro botón visible.
    const handleButtonClick = () => {
        // Simula un clic en el input de archivo, que está oculto.
        // Esto abre el explorador de archivos del sistema.
        fileInputRef.current.click();
    };

    // Esta función se activa cuando el usuario selecciona un archivo en el explorador.
    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Obtenemos el primer archivo seleccionado.
        console.log('[CSVImporter] Archivo seleccionado:', file);
        // Si se seleccionó un archivo, llamamos a la función que nos pasó el componente padre.
        if (file) {
            console.log('[CSVImporter] Llamando a onFileSelected...')
            onFileSelected(file);
        }

        // Reseteamos el valor para poder seleccionar el mismo archivo de nuevo
        e.target.value = null;
    };

    return (
        <div>
            {/* 
              Este es el input de archivo real. Está oculto con 'display: none',
              pero lo necesitamos para la funcionalidad nativa de subida de archivos.
              'accept=".csv"' le dice al navegador que filtre por archivos CSV.
            */}
            <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={isLoading}
            />

            {/* Este es el botón que el usuario ve y con el que interactúa. */}
            <button 
                type="button" // Es un botón simple, no de submit.
                onClick={handleButtonClick} 
                disabled={isLoading} 
                style={{ marginLeft: '1rem' }}
            >
                {/* El texto del botón cambia dinámicamente. */}
                {isLoading ? 'Importando...' : buttonText}
            </button>
        </div>
    );
};

export default CSVImporter;