// src/components/Review.js
import React from 'react';

const Review = ({ details, questions }) => {
    // Si aún no se han cargado las preguntas, no renderizar nada.
    if (!questions || questions.length === 0) {
        return <p>Cargando detalles de la revisión...</p>;
    }

    // Un mapa para buscar rápidamente preguntas por ID
    const questionsMap = new Map(questions.map(q => [q._id, q]));

    const getOptionStyle = (optionLetter, userAnswer, correctAnswer) => {
        if (optionLetter === correctAnswer) {
            return { backgroundColor: '#dcfce7', borderLeft: '5px solid #22c55e', padding: '10px' };
        }
        if (optionLetter === userAnswer && userAnswer !== correctAnswer) {
            return { backgroundColor: '#fee2e2', borderLeft: '5px solid #ef4444', padding: '10px' };
        }
        return { padding: '10px', borderLeft: '5px solid #e5e7eb' };
    };

    return (
        <div style={{marginTop: '40px'}}>
            <h2 style={{borderTop: '1px solid #ccc', paddingTop: '20px'}}>Revisión Detallada del Balotario</h2>
            {details.map((item, index) => {
                const question = questionsMap.get(item.questionId); // Busca la pregunta completa
                if (!question) return null; // No renderiza si no se encuentra la pregunta

                return (
                    <div key={item.questionId} className="question-block" style={{background: '#f9fafb'}}>
                        <p className="question-title">{index + 1}. {item.questionText}</p>
                        <ul className="options-list">
                            {question.options.map(opt => (
                                <li 
                                    key={opt.letter}
                                    style={getOptionStyle(opt.letter, item.userAnswer, item.correctAnswer)}
                                >
                                    {opt.text}
                                    {item.userAnswer === opt.letter && <strong> (Tu respuesta)</strong>}
                                </li>
                            ))}
                        </ul>
                        {/* Mostramos el feedback detallado que viene de la BD */}
                        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#eef2ff', borderRadius: '6px' }}>
                            <strong>Explicación:</strong> {question.feedback}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Review;