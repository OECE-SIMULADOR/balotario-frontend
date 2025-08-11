// src/context/TimerContext.js
import React, { createContext, useState, useContext, useRef, useCallback } from 'react';

const TimerContext = createContext();
export const useTimer = () => useContext(TimerContext);

const storageKeyPrefix = "timer_"; // Prefijo para nuestras claves de localStorage

export const TimerProvider = ({ children }) => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef(null);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsActive(false);
    }, []);

    const startTimer = useCallback((balotarioId, initialSeconds = 120 * 60) => {
        stopTimer(); // Primero detenemos cualquier timer anterior

        const storageKey = `${storageKeyPrefix}${balotarioId}`;
        const savedEndTime = localStorage.getItem(storageKey);
        
        let startTime = Date.now();
        let secondsLeft;

        if (savedEndTime && parseInt(savedEndTime, 10) > startTime) {
            // Si hay un tiempo final guardado Y no ha expirado, continuamos desde ahí
            secondsLeft = Math.round((parseInt(savedEndTime, 10) - startTime) / 1000);
            console.log(`[Timer] Reanudando desde localStorage. Tiempo restante: ${secondsLeft}s`);
        } else {
            // Si no hay nada guardado o ya expiró, empezamos de nuevo
            secondsLeft = initialSeconds;
            const newEndTime = startTime + initialSeconds * 1000;
            localStorage.setItem(storageKey, newEndTime.toString());
            console.log(`[Timer] Iniciando nuevo temporizador. Duración: ${initialSeconds}s`);
        }
        
        setSeconds(secondsLeft);
        setIsActive(true);

        intervalRef.current = setInterval(() => {
            setSeconds(prev => {
                if (prev <= 1) {
                    stopTimer();
                    localStorage.removeItem(storageKey);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

    }, [stopTimer]);
    
    const clearTimerForBalotario = useCallback((balotarioId) => {
        stopTimer();
        setSeconds(0);
        localStorage.removeItem(`${storageKeyPrefix}${balotarioId}`);
        console.log(`[Timer] Limpiado temporizador para balotario ${balotarioId}`);
    }, [stopTimer]);

    const value = { seconds, isActive, startTimer, stopTimer, clearTimerForBalotario };
    
    return <TimerContext.Provider value={value}> {children} </TimerContext.Provider>;
};