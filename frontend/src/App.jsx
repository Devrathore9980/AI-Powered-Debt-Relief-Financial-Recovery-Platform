import { useState } from 'react'
import axios from 'axios'
import Dashboard from './Dashboard'
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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

  return (
    <div className="App">
      <h1>FinRelief AI</h1>
      <button onClick={() => { setIsLogin(!isLogin); setMessage('') }}>
        {isLogin ? 'Switch to Register' : 'Switch to Login'}
      </button>

      <form onSubmit={isLogin ? handleLogin : handleRegister}>
        {!isLogin && (
          <div>
            <label>Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  )
}

export default App