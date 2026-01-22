import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import './Login.css'

function Login({ setUser }) {
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleLogin = async (provider) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin
        }
      })

      if (error) throw error

      // After successful login, we'll be redirected back
      // Handle the auth state change in App.jsx
    } catch (error) {
      console.error('Error logging in:', error.message)
      alert('Ошибка входа. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <button 
        className="btn-login"
        onClick={() => setShowMenu(!showMenu)}
      >
        Войти
      </button>
      
      {showMenu && (
        <div className="login-menu">
          <div className="login-header">Выберите провайдер:</div>
          <button 
            className="btn-provider btn-google"
            onClick={() => handleLogin('google')}
            disabled={loading}
          >
            <span className="provider-icon">G</span>
            Google
          </button>
          <button 
            className="btn-provider btn-yandex"
            onClick={() => handleLogin('yandex')}
            disabled={loading}
          >
            <span className="provider-icon">Y</span>
            Yandex
          </button>
          <button 
            className="btn-provider btn-vk"
            onClick={() => handleLogin('vk')}
            disabled={loading}
          >
            <span className="provider-icon">VK</span>
            VK
          </button>
          <button 
            className="btn-provider btn-github"
            onClick={() => handleLogin('github')}
            disabled={loading}
          >
            <span className="provider-icon">GH</span>
            GitHub
          </button>
        </div>
      )}
    </div>
  )
}

export default Login
