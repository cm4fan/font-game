import React, { useState } from 'react'
import './GameResults.css'

function GameResults({ score, totalRounds, user, bestScore, stats, onRestart }) {
  const [showDetails, setShowDetails] = useState(false)
  const percentage = Math.round((score / totalRounds) * 100)

  const getRating = (percentage) => {
    if (percentage >= 90) return { text: 'Типографический гений!', icon: 'trophy' }
    if (percentage >= 75) return { text: 'Отличные знания!', icon: 'star' }
    if (percentage >= 60) return { text: 'Хороший результат!', icon: 'thumb' }
    if (percentage >= 40) return { text: 'Есть куда расти!', icon: 'book' }
    return { text: 'Продолжайте учиться!', icon: 'target' }
  }

  const getIcon = (iconName) => {
    const icons = {
      trophy: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0 5H6"/>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>
      ),
      star: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      thumb: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 11v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3a4 4 0 0 0 4-4V6a2 2 0 0 1 4 0v1"/>
          <path d="M15 11V8"/>
        </svg>
      ),
      book: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ),
      target: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      )
    }
    return icons[iconName] || null
  }

  const rating = getRating(percentage)

  const handleShare = async () => {
    const shareText = `Я набрал ${score} из ${totalRounds} очков (${percentage}%) в Font Game!`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Font Game',
          text: shareText,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(shareText + ' ' + window.location.href)
      alert('Результат скопирован в буфер обмена!')
    }
  }

  return (
    <div className="game-results">
      <div className="results-container">
        <h2 className="results-title">Игра завершена!</h2>
        
        <div className="score-display">
          <div className="score-number">{score}</div>
          <div className="score-divider">/</div>
          <div className="score-total">{totalRounds}</div>
        </div>
        
        <div className="percentage">{percentage}%</div>
        
        <div className="rating">
          <span className="rating-icon">{getIcon(rating.icon)}</span>
          <span className="rating-text">{rating.text}</span>
        </div>

        {user && score > 0 && (
          <div className="best-score-display">
            Лучший результат: {bestScore}
          </div>
        )}

        <div className="results-actions">
          <button className="btn-restart" onClick={onRestart}>
            Играть снова
          </button>
          <button className="btn-share" onClick={handleShare}>
            Поделиться
          </button>
          <button 
            className="btn-details"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Скрыть' : 'Подробности'}
          </button>
        </div>

        {showDetails && (
          <div className="stats-details">
            <h3>Анализ по категориям</h3>
            
            <div className="stats-section">
              <h4>Типы шрифтов</h4>
              {Object.entries(stats.typeStats).map(([type, data]) => (
                <div key={type} className="stat-item">
                  <span className="stat-name">{type}</span>
                  <div className="stat-bar-container">
                    <div 
                      className="stat-bar"
                      style={{ width: `${(data.correct / data.total) * 100}%` }}
                    />
                  </div>
                  <span className="stat-value">{data.correct}/{data.total}</span>
                </div>
              ))}
            </div>

            <div className="stats-section">
              <h4>Стили шрифтов</h4>
              {Object.entries(stats.styleStats)
                .sort(([, a], [, b]) => b.total - a.total)
                .slice(0, 5)
                .map(([style, data]) => (
                  <div key={style} className="stat-item">
                    <span className="stat-name">{style}</span>
                    <div className="stat-bar-container">
                      <div 
                        className="stat-bar"
                        style={{ width: `${(data.correct / data.total) * 100}%` }}
                      />
                    </div>
                    <span className="stat-value">{data.correct}/{data.total}</span>
                  </div>
                ))}
            </div>

            <div className="recommendations">
              <h4>Рекомендации</h4>
              {Object.entries(stats.typeStats)
                .filter(([_, data]) => data.correct / data.total < 0.5)
                .map(([type]) => (
                  <p key={type} className="recommendation">
                    Изучите шрифты типа "{type}" для улучшения результатов
                  </p>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameResults
