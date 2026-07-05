import { useState } from 'react'
import axios from 'axios'

function Dashboard({ userEmail, onLogout }) {
  const [loanAmount, setLoanAmount] = useState('')
  const [overdueMonths, setOverdueMonths] = useState('')
  const [stressLevel, setStressLevel] = useState('Medium')
  const [strategy, setStrategy] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setStrategy('')

    try {
      const response = await axios.post('http://127.0.0.1:8000/debt-record', {
        user_email: userEmail,
        loan_amount: parseFloat(loanAmount),
        overdue_months: parseInt(overdueMonths),
        debt_stress_level: stressLevel
      })
      setStrategy(response.data.ai_strategy)
    } catch (err) {
      setError(err.response ? err.response.data.detail : 'Backend se connect nahi ho paya')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="Dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>FinRelief AI - Dashboard</h1>
        <button onClick={onLogout}>Logout</button>
      </div>
      <p>Welcome, {userEmail}</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Loan Amount (₹):</label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Overdue Months:</label>
          <input
            type="number"
            value={overdueMonths}
            onChange={(e) => setOverdueMonths(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Debt Stress Level:</label>
          <select value={stressLevel} onChange={(e) => setStressLevel(e.target.value)}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Generating Strategy...' : 'Get Negotiation Strategy'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {strategy && (
        <div style={{ marginTop: '20px', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
          <h3>Your Negotiation Strategy:</h3>
          <p>{strategy}</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard