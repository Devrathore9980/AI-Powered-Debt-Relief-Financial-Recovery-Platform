import { useState } from 'react'
import axios from 'axios'
import Dashboard from './Dashboard'
import './App.css'
import Landing from './Landing'

function App() {
  const [isLogin, setIsLogin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://127.0.0.1:8000/register', {
        name, email, password
      })
      setMessage(`Success! User registered with ID: ${response.data.id}`)
    } catch (error) {
      setMessage(error.response ? `Error: ${error.response.data.detail}` : 'Backend se connect nahi ho paya')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/login?email=${email}&password=${password}`
      )
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('userEmail', email)
      setIsLoggedIn(true)
    } catch (error) {
      setMessage(error.response ? `Error: ${error.response.data.detail}` : 'Backend se connect nahi ho paya')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    setIsLoggedIn(false)
    setEmail('')
    setPassword('')
  }

  if (isLoggedIn) {
    return <Dashboard userEmail={localStorage.getItem('userEmail')} onLogout={handleLogout} />
  }

  if (isLoggedIn) {
  return <Dashboard userEmail={localStorage.getItem('userEmail')} onLogout={handleLogout} />
}

if (!showAuth) {
  return <Landing onGetStarted={() => setShowAuth(true)} />
}

  return (
    <div className="App">
      <h1>FinRelief AI</h1>
      <div className="card">
        <button className="btn-link" onClick={() => { setIsLogin(!isLogin); setMessage('') }}>
          {isLogin ? 'Naya account banayein →' : 'Pehle se account hai? Login karein →'}
        </button>

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <div className="field">
              <label>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
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

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  )
}

export default App