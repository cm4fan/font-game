import React, { useState } from 'react'
import './GameResults.css'

function GameResults({ score, totalRounds, user, bestScore, stats, onRestart }) {
  const [showDetails, setShowDetails] = useState(false)
  const percentage = Math.round((score / totalRounds) * 100)

  const getRating = (percentage) => {
    if (percentage >= 90) return { text: 'Типографический гений!', emoji: '🏆' }
    if (percentage >= 75) return { text: 'Отличные знания!', emoji: '🌟' }
    if (percentage >= 60) return { text: 'Хороший результат!', emoji: '👍' }
    if (percentage >= 40) return { text: 'Есть куда расти!', emoji: '📚' }
    return { text: 'Продолжайте учиться!', emoji: '💪' }
  }

  const rating = getRating(percentage)

  const handleShare = async () => {
    const shareText = `Я набрал ${score} из ${totalRounds} очков (${percentage}%) в Font Game! ${rating.emoji}`
    
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
          <span className="rating-emoji">{rating.emoji}</span>
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
                    💡 Изучите шрифты типа "{type}" для улучшения результатов
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
