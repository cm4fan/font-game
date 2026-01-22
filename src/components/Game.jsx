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
    const availableFonts = fontsData.filter(f => f.id !== correctFont.id)
    
    // Calculate similarity score for each font
    const fontsWithSimilarity = availableFonts.map(font => {
      let similarity = 0
      if (font.tags.type === correctFont.tags.type) similarity += 1
      if (font.tags.style === correctFont.tags.style) similarity += 1
      
      return { font, similarity }
    })
    
    // Sort by similarity (most similar first)
    fontsWithSimilarity.sort((a, b) => b.similarity - a.similarity)
    
    // Determine how many similar fonts to include based on round
    let similarCount
    if (currentRound <= 7) {
      similarCount = 0 // Early rounds: mostly different
    } else if (currentRound <= 14) {
      similarCount = 1 // Middle rounds: some similar
    } else {
      similarCount = 2 // Late rounds: more similar
    }
    
    // Select distractors
    const similarDistractors = fontsWithSimilarity
      .filter(item => item.similarity >= 1)
      .slice(0, similarCount)
      .map(item => item.font)
    
    const differentDistractors = fontsWithSimilarity
      .filter(item => item.similarity === 0)
      .slice(0, 3 - similarCount)
      .map(item => item.font)
    
    // If we don't have enough fonts, fill from remaining
    const remainingFonts = availableFonts.filter(f => 
      !similarDistractors.includes(f) && 
      !differentDistractors.includes(f)
    )
    
    while (similarDistractors.length + differentDistractors.length < 3) {
      if (remainingFonts.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingFonts.length)
        differentDistractors.push(remainingFonts[randomIndex])
        remainingFonts.splice(randomIndex, 1)
      } else {
        break
      }
    }
    
    const allAnswers = [correctFont, ...similarDistractors, ...differentDistractors].slice(0, 4)
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
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span>20 раундов</span>
            </div>
            <div className="feature">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 2 12 22"/>
                <polyline points="16 6 12 12 12 18"/>
              </svg>
              <span>Прогрессивная сложность</span>
            </div>
            <div className="feature">
              <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0 5h2"/>
                <path d="M18 9h-1.5a2.5 2.5 0 0 0-5 0h2"/>
                <path d="M12 15.5A2.5 2.5 0 0 0 9.5 12 14 6.5 2.5 2.5 0 0 0-2.5 8z"/>
                <path d="M12 6l2.5 2.5"/>
                <path d="M9.5 8.5L7 11l5 2.5 5-2.5-2.5-5"/>
              </svg>
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
