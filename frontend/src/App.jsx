import { useState } from 'react'
import axios from 'axios'
import Dashboard from './Dashboard'
import './App.css'
import Landing from './landing'

function App() {
  const [isLogin, setIsLogin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [loginTransitioning, setLoginTransitioning] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showForgot, setShowForgot] = useState(false)   

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState('Aapke pehle pet ka naam kya tha?')  
  const [securityAnswer, setSecurityAnswer] = useState('')  
  const [newPassword, setNewPassword] = useState('')        
  const [message, setMessage] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/register`, {
        name, email, password,
        security_question: securityQuestion,   
        security_answer: securityAnswer        
      })
      setMessage(`Success! User registered with ID: ${response.data.id}`)
    } catch (error) {
      setMessage(error.response ? `Error: ${error.response.data.detail}` : 'Failed to connect to the backend')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login?email=${email}&password=${password}`
      )
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('userEmail', email)
      setLoginTransitioning(true)
      setTimeout(() => {
        setIsLoggedIn(true)
      }, 460)
    } catch (error) {
      setMessage(error.response ? `Error: ${error.response.data.detail}` : 'Failed to connect to the backend')
    }
  }

  
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/forgot-password`, {
        email,
        security_answer: securityAnswer,
        new_password: newPassword
      })
      setMessage(response.data.message)
      setShowForgot(false)
    } catch (error) {
      setMessage(error.response ? `Error: ${error.response.data.detail}` : 'Failed to connect to the backend')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    setIsLoggedIn(false)
    setShowAuth(false)
    setEmail('')
    setPassword('')
  }

  if (isLoggedIn) {
    return <Dashboard userEmail={localStorage.getItem('userEmail')} onLogout={handleLogout} />
  }

  if (!showAuth) {
    return <Landing onGetStarted={() => setShowAuth(true)} />
  }

  
  if (showForgot) {
    return (
      <div className="App">
        <h1>FinRelief AI</h1>
        <div className="card">
          <button className="btn-link" onClick={() => { setShowForgot(false); setMessage('') }}>
            ← Go back to Login
          </button>
          <form onSubmit={handleForgotPassword}>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>{securityQuestion}</label>
              <input type="text" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} />
            </div>
            <div className="field">
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <button className="btn-primary" type="submit">Reset Your Password</button>
          </form>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={`AuthPage ${loginTransitioning ? 'auth-transitioning' : ''}`}>
      <div className="auth-bg-card">
        <div className="abc-top">
          <div className="abc-chip"></div>
          <span className="abc-brand">FinRelief AI</span>
        </div>
        <div className="abc-number">•••• •••• •••• 4521</div>
        <div className="abc-bottom">
          <div>
            <p className="abc-label">Card Holder</p>
            <p className="abc-value">{name || 'YOUR NAME'}</p>
          </div>
          <div>
            <p className="abc-label">Valid Thru</p>
            <p className="abc-value">12/29</p>
          </div>
        </div>
      </div>

      <div className="App">
        <h1>FinRelief AI</h1>
        <div className="card">
          <button className="btn-link" onClick={() => { setIsLogin(!isLogin); setMessage('') }}>
            {isLogin ? 'Create New Account →' : 'Already have an account? Sign in →'}
          </button>

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <>
              <div className="field">
                <label>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label>Security Question</label>
                <select value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)}>
                  <option>Aapke pehle pet ka naam kya tha?</option>
                  <option>Aapke school ka naam kya tha?</option>
                  <option>Aapki favorite city kaunsi hai?</option>
                </select>
              </div>
              <div className="field">
                <label>Security Answer</label>
                <input type="text" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} />
              </div>
            </>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn-primary" type="submit">{isLogin ? 'Login' : 'Register'}</button>
        </form>

        {isLogin && (
          <button className="btn-link" onClick={() => { setShowForgot(true); setMessage('') }}>
            Forgot Password?
          </button>
        )}

        {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  )
}

export default App