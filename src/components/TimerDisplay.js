// src/components/TimerDisplay.js
import React from 'react';
import { useTimer } from '../context/TimerContext';

const TimerDisplay = () => {
    const { seconds, isActive } = useTimer();
    
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${secs}`;
    };
    
    // Si el timer no está activo o el tiempo es cero, no se renderiza nada
    if (!isActive || seconds <= 0) {
        return null; 
    }

    const timerClass = `timer-display ${seconds < 60 * 5 ? 'warning' : ''}`;
    
    return (
        <div className={timerClass}>
            <strong>Tiempo Restante:</strong> {formatTime(seconds)}
        </div>
    );
};

export default TimerDisplay;