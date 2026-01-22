import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import fontsData from '../data/fonts.json'
import FontCard from './FontCard'
import GameResults from './GameResults'
import './Game.css'

function Game({ user }) {
  const [gameState, setGameState] = useState('start') // 'start', 'playing', 'result'
  const [currentRound, setCurrentRound] = useState(1)
  const [score, setScore] = useState(0)
  const [currentFont, setCurrentFont] = useState(null)
  const [answers, setAnswers] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [cardFlipped, setCardFlipped] = useState(false)
  const [gameHistory, setGameHistory] = useState([])
  const [bestScore, setBestScore] = useState(0)

  const TOTAL_ROUNDS = 20

  useEffect(() => {
    if (user) {
      loadBestScore()
    }
  }, [user])

  const loadBestScore = async () => {
    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('score')
        .eq('user_id', user.id)
        .order('score', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setBestScore(data.score)
      }
    } catch (error) {
      console.error('Error loading best score:', error)
    }
  }

  const startGame = () => {
    setGameState('playing')
    setCurrentRound(1)
    setScore(0)
    setGameHistory([])
    startNewRound()
  }

  const startNewRound = () => {
    const availableFonts = fontsData.filter(f => 
      !gameHistory.find(h => h.font.id === f.id)
    )
    
    const randomFont = availableFonts[Math.floor(Math.random() * availableFonts.length)]
    setCurrentFont(randomFont)
    setAnswers(generateAnswers(randomFont))
    setSelectedAnswer(null)
    setShowResult(false)
    setCardFlipped(false)
  }

  const generateAnswers = (correctFont) => {
    const similarFonts = fontsData
      .filter(f => 
        f.id !== correctFont.id && 
        (f.tags.type === correctFont.tags.type || 
         f.tags.style === correctFont.tags.style)
      )
      .slice(0, 3)

    const otherFonts = fontsData
      .filter(f => 
        f.id !== correctFont.id && 
        f.tags.type !== correctFont.tags.type && 
        f.tags.style !== correctFont.tags.style
      )
      .slice(0, 3 - similarFonts.length)

    const distractors = [...similarFonts, ...otherFonts]
    
    // Mix similar and different fonts based on round
    let selectedDistractors
    if (currentRound <= 7) {
      // Early rounds: more different fonts
      selectedDistractors = otherFonts.slice(0, 3)
    } else if (currentRound <= 14) {
      // Middle rounds: mix
      selectedDistractors = [...similarFonts.slice(0, 2), ...otherFonts.slice(0, 1)]
    } else {
      // Late rounds: more similar fonts
      selectedDistractors = [...similarFonts.slice(0, 2), ...otherFonts.slice(0, 1)]
    }

    const allAnswers = [correctFont, ...selectedDistractors]
    return shuffleArray(allAnswers)
  }

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleAnswer = (answer) => {
    if (showResult) return

    const isCorrect = answer.id === currentFont.id
    setSelectedAnswer(answer)
    setShowResult(true)
    setCardFlipped(true)

    const newScore = isCorrect ? score + 1 : score
    setScore(newScore)

    setGameHistory([
      ...gameHistory,
      {
        font: currentFont,
        selected: answer,
        isCorrect,
        round: currentRound
      }
    ])

    if (isCorrect && user && newScore > bestScore) {
      setBestScore(newScore)
    }
  }

  const handleNext = () => {
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound(currentRound + 1)
      startNewRound()
    } else {
      endGame()
    }
  }

  const endGame = async () => {
    setGameState('result')
    
    if (user && score > 0) {
      try {
        await supabase
          .from('game_results')
          .insert([{
            user_id: user.id,
            score: score,
            total_rounds: TOTAL_ROUNDS,
            correct_answers: score,
            created_at: new Date().toISOString()
          }])

        if (score > bestScore) {
          setBestScore(score)
        }
      } catch (error) {
        console.error('Error saving result:', error)
      }
    }
  }

  const calculateStats = () => {
    const typeStats = {}
    const styleStats = {}
    
    gameHistory.forEach(h => {
      const type = h.font.tags.type
      const style = h.font.tags.style
      
      if (!typeStats[type]) {
        typeStats[type] = { correct: 0, total: 0 }
      }
      if (!styleStats[style]) {
        styleStats[style] = { correct: 0, total: 0 }
      }
      
      typeStats[type].total++
      styleStats[style].total++
      
      if (h.isCorrect) {
        typeStats[type].correct++
        styleStats[style].correct++
      }
    })
    
    return { typeStats, styleStats }
  }

  if (gameState === 'start') {
    return (
      <div className="game-container game-start">
        <div className="game-intro">
          <h2 className="game-title">Опознавание шрифтов</h2>
          <p className="game-description">
            Проверьте свои знания типографики! Угадайте 20 шрифтов и узнайте, 
            в каких стилях вы разбираетесь лучше всего.
          </p>
          <div className="game-features">
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <span>20 раундов</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📈</span>
              <span>Прогрессивная сложность</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🏆</span>
              <span>Система рейтинга</span>
            </div>
          </div>
          {user && bestScore > 0 && (
            <div className="best-score">
              Ваш лучший результат: <span className="score-value">{bestScore}</span>
            </div>
          )}
          <button className="btn-start" onClick={startGame}>
            Начать игру
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'result') {
    const stats = calculateStats()
    return (
      <GameResults
        score={score}
        totalRounds={TOTAL_ROUNDS}
        user={user}
        bestScore={bestScore}
        stats={stats}
        onRestart={startGame}
      />
    )
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="round-counter">{currentRound}/{TOTAL_ROUNDS}</div>
        <div className="score-counter">Очки: {score}</div>
      </div>

      <div className="game-content">
        <h2 className="question">Какой это шрифт?</h2>
        
        <FontCard
          font={currentFont}
          flipped={cardFlipped}
          showResult={showResult}
          isCorrect={selectedAnswer?.id === currentFont.id}
        />

        <div className="answers-grid">
          {answers.map((answer) => (
            <button
              key={answer.id}
              className={`answer-btn ${selectedAnswer?.id === answer.id ? 'selected' : ''} ${showResult ? 'revealed' : ''}`}
              onClick={() => handleAnswer(answer)}
              disabled={showResult}
            >
              {answer.name}
            </button>
          ))}
        </div>

        {showResult && (
          <button className="btn-next" onClick={handleNext}>
            {currentRound < TOTAL_ROUNDS ? 'Дальше' : 'Результаты'}
          </button>
        )}
      </div>
    </div>
  )
}

export default Game
