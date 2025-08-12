// src/context/TimerContext.js
import React, { createContext, useState, useContext, useRef, useCallback } from 'react';

const TimerContext = createContext();
export const useTimer = () => useContext(TimerContext);
const storageKeyPrefix = "timer_endTime_";

export const TimerProvider = ({ children }) => {
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef(null);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsActive(false);
    }, []);

    const startTimer = useCallback((balotarioId, initialSeconds) => {
        stopTimer(); // Limpia cualquier temporizador anterior

        const storageKey = `${storageKeyPrefix}${balotarioId}`;
        let endTime = parseInt(localStorage.getItem(storageKey), 10);
        const now = Date.now();
        
        // Si no hay un endTime guardado, o si ya pasó, creamos uno nuevo
        if (!endTime || endTime < now) {
            endTime = now + initialSeconds * 1000;
            localStorage.setItem(storageKey, endTime.toString());
        }

        const updateDisplay = () => {
            const newNow = Date.now();
            const remaining = Math.round((endTime - newNow) / 1000);
            
            if (remaining > 0) {
                setSecondsLeft(remaining);
            } else {
                setSecondsLeft(0);
                stopTimer();
                localStorage.removeItem(storageKey);
                // Aquí podrías tener un callback 'onTimeUp()' si fuera necesario
                console.log("[Timer] ¡Tiempo finalizado!");
            }
        };

        updateDisplay(); // Actualización inmediata al inicio
        setIsActive(true);
        intervalRef.current = setInterval(updateDisplay, 1000);

    }, [stopTimer]);

    const clearTimerForBalotario = useCallback((balotarioId) => {
        stopTimer();
        setSecondsLeft(0);
        localStorage.removeItem(`${storageKeyPrefix}${balotarioId}`);
    }, [stopTimer]);
    
    // Cambiamos el nombre de 'seconds' a 'secondsLeft' para mayor claridad
    const value = { secondsLeft, isActive, startTimer, stopTimer, clearTimerForBalotario };
    
    return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};