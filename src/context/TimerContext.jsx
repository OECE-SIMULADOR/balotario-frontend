// src/context/TimerContext.js

import React, { createContext, useState, useContext, useRef, useCallback, useMemo } from 'react';

// --- Creación y exportación del Contexto y el Hook ---
const TimerContext = createContext();
export const useTimer = () => useContext(TimerContext);

// Prefijo para las claves de localStorage, para evitar colisiones
const storageKeyPrefix = "timer_";

// --- Proveedor del Contexto ---
export const TimerProvider = ({ children }) => {
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef(null);

    // --- Definición de Funciones ---

    // Detiene cualquier intervalo activo
    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsActive(false);
    }, []);

    // Inicia una nueva cuenta regresiva, recuperando el estado si existe
    const startTimer = useCallback((balotarioId, initialSeconds = 7200) => { // 120 min = 7200s
        stopTimer(); // Siempre detenemos cualquier timer anterior

        const storageKey = `${storageKeyPrefix}${balotarioId}`;
        const savedEndTime = localStorage.getItem(storageKey);
        
        let secondsToStartFrom;
        const now = Date.now();

        if (savedEndTime && parseInt(savedEndTime, 10) > now) {
            // Reanudamos desde un estado guardado
            secondsToStartFrom = Math.round((parseInt(savedEndTime, 10) - now) / 1000);
            console.log(`[Timer] Reanudando desde localStorage. Tiempo restante: ${secondsToStartFrom}s`);
        } else {
            // Empezamos un nuevo temporizador
            secondsToStartFrom = initialSeconds;
            const newEndTime = now + initialSeconds * 1000;
            localStorage.setItem(storageKey, newEndTime.toString());
            console.log(`[Timer] Iniciando nuevo temporizador de ${initialSeconds}s`);
        }
        
        setSecondsLeft(secondsToStartFrom);
        setIsActive(true);

        intervalRef.current = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    // Limpiamos y detenemos al llegar a 0
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setIsActive(false);
                    localStorage.removeItem(storageKey);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

    }, [stopTimer]);

    // ...continuación de TimerContext.js

    // Limpia el temporizador para un balotario específico (al finalizar o reiniciar)
    const clearTimerForBalotario = useCallback((balotarioId) => {
        stopTimer();
        setSecondsLeft(0);
        localStorage.removeItem(`${storageKeyPrefix}${balotarioId}`);
        console.log(`[Timer] Limpiado temporizador para balotario ${balotarioId}`);
    }, [stopTimer]);
    
    // --- >>>>> CORRECCIÓN CLAVE: El objeto 'value' <<< ---
    // Usamos useMemo para optimización y nos aseguramos de que TODAS las funciones
    // estén incluidas aquí para que los componentes puedan usarlas.
    const value = useMemo(() => ({
        secondsLeft,
        isActive,
        startTimer,
        stopTimer, // <--- Debe estar aquí para no ser 'undefined'
        clearTimerForBalotario, // <--- Debe estar aquí también
    }), [secondsLeft, isActive, startTimer, stopTimer, clearTimerForBalotario]);
    
    return (
        <TimerContext.Provider value={value}>
            {children}
        </TimerContext.Provider>
    );
};