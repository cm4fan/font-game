import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import './Leaderboard.css'

function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('all')

  useEffect(() => {
    loadLeaderboard()
  }, [timeFilter])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('game_results')
        .select(`
          score,
          user_id,
          created_at,
          profiles!inner (
            email,
            username
          )
        `)

      // Apply time filter
      const now = new Date()
      if (timeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        query = query.gte('created_at', weekAgo.toISOString())
      } else if (timeFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        query = query.gte('created_at', monthAgo.toISOString())
      }

      const { data, error } = await query
        .order('score', { ascending: false })
        .limit(50)

      if (error) throw error

      // Aggregate scores by user
      const userScores = {}
      data.forEach(result => {
        const userId = result.user_id
        const username = result.profiles?.username || result.profiles?.email
        if (!userScores[userId]) {
          userScores[userId] = {
            user_id: userId,
            username: username,
            score: result.score,
            games: 1
          }
        } else {
          userScores[userId].score = Math.max(userScores[userId].score, result.score)
          userScores[userId].games += 1
        }
      })

      const leaderboard = Object.values(userScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)

      setLeaders(leaderboard)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
      // Use demo data if Supabase is not configured
      setLeaders(getDemoLeaderboard())
    } finally {
      setLoading(false)
    }
  }

  const getDemoLeaderboard = () => [
    { user_id: '1', username: 'Alex_Pro', score: 19, games: 15 },
    { user_id: '2', username: 'FontMaster', score: 18, games: 20 },
    { user_id: '3', username: 'TypeDesigner', score: 17, games: 12 },
    { user_id: '4', username: 'TypographyFan', score: 16, games: 18 },
    { user_id: '5', username: 'DesignLover', score: 15, games: 25 },
    { user_id: '6', username: 'FontExpert', score: 14, games: 10 },
    { user_id: '7', username: 'TypeEnthusiast', score: 13, games: 22 },
    { user_id: '8', username: 'DesignPro', score: 12, games: 16 },
    { user_id: '9', username: 'FontGeek', score: 11, games: 14 },
    { user_id: '10', username: 'TypographyLover', score: 10, games: 20 }
  ]

  const getMedal = (index) => {
    if (index === 0) return '1'
    if (index === 1) return '2'
    if (index === 2) return '3'
    return null
  }

  const getUsername = (username) => {
    if (!username) return 'Аноним'
    // Extract username from email if it's an email
    if (username.includes('@')) {
      return username.split('@')[0]
    }
    return username
  }

  if (loading) {
    return (
      <div className="leaderboard loading">
        <div className="leaderboard-container">
          <h2 className="leaderboard-title">Таблица лидеров</h2>
          <div className="loading-spinner">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-container">
        <h2 className="leaderboard-title">Таблица лидеров</h2>
        
        <div className="leaderboard-filters">
          <button 
            className={`filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTimeFilter('all')}
          >
            Все время
          </button>
          <button 
            className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
            onClick={() => setTimeFilter('month')}
          >
            Месяц
          </button>
          <button 
            className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
            onClick={() => setTimeFilter('week')}
          >
            Неделя
          </button>
        </div>

        <div className="leaderboard-list">
          {leaders.map((leader, index) => (
            <div key={leader.user_id} className="leaderboard-item">
              <div className="leaderboard-rank">
                {getMedal(index) || index + 1}
              </div>
              <div className="leaderboard-user">
                {getUsername(leader.username)}
              </div>
              <div className="leaderboard-score">
                <span className="score-value">{leader.score}</span>
                <span className="score-label">очков</span>
              </div>
            </div>
          ))}
        </div>

        {leaders.length === 0 && (
          <div className="empty-leaderboard">
            <p>Пока нет результатов. Станьте первым!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
