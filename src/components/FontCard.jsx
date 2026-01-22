import React from 'react'
import './FontCard.css'

function FontCard({ font, flipped, showResult, isCorrect }) {
  return (
    <div className={`card-container ${flipped ? 'flipped' : ''}`}>
      <div className="card-inner">
        <div className="card-front">
          <div className="font-letter" style={{ fontFamily: font.name }}>
            {font.letter}
          </div>
        </div>
        <div className="card-back">
          <h3 className="font-name">{font.name}</h3>
          <div className="font-details">
            <p className="font-year">Год: {font.year}</p>
            <p className="font-author">Автор: {font.author}</p>
            <p className="font-description">{font.description}</p>
            <div className="font-tags">
              <span className="tag tag-type">{font.tags.type}</span>
              <span className="tag tag-style">{font.tags.style}</span>
            </div>
          </div>
          {showResult && (
            <div className={`result-indicator ${isCorrect ? 'correct' : 'incorrect'}`}>
              {isCorrect ? '✓ Правильно!' : '✗ Неправильно'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FontCard
