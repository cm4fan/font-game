import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Game from './components/Game'
import Leaderboard from './components/Leaderboard'
import Login from './components/Login'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Font Game</h1>
        <div className="app-controls">
          {user ? (
            <span className="user-info">{user.email}</span>
          ) : (
            <Login setUser={setUser} />
          )}
          <button 
            className="btn-leaderboard"
            onClick={() => setShowLeaderboard(!showLeaderboard)}
          >
            {showLeaderboard ? 'Игра' : 'Рейтинг'}
          </button>
        </div>
      </header>
      
      <main className="app-main">
        {showLeaderboard ? (
          <Leaderboard />
        ) : (
          <Game user={user} />
        )}
      </main>
    </div>
  )
}

export default App
