import { useState, useEffect } from 'react'
import axios from 'axios'

function Dashboard({ userEmail, onLogout }) {
  const [loanAmount, setLoanAmount] = useState('')
  const [overdueMonths, setOverdueMonths] = useState('')
  const [stressLevel, setStressLevel] = useState('Medium')
  const [language, setLanguage] = useState('English')
  const [strategy, setStrategy] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Naya state — dashboard summary aur loans list ke liye
  const [dashboardData, setDashboardData] = useState(null)
  const [dashboardError, setDashboardError] = useState('')

  const token = localStorage.getItem('token')

  // Dashboard data fetch karne wala function
  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/dashboard-data', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDashboardData(response.data)
    } catch (err) {
      setDashboardError(err.response ? err.response.data.detail : 'Dashboard data load nahi hua')
    }
  }

  // Component load hote hi ek baar dashboard data fetch karo
  useEffect(() => {
    fetchDashboardData()
  }, [])

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
        debt_stress_level: stressLevel,
        language: language
      })
      setStrategy(response.data.ai_strategy)

      // Naya loan add hone ke baad dashboard data refresh karo
      fetchDashboardData()
    } catch (err) {
      setError(err.response ? err.response.data.detail : 'Backend se connect nahi ho paya')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="Dashboard">
      <div className="top-bar">
        <h1>FinRelief AI</h1>
        <button onClick={onLogout}>Logout</button>
      </div>
      <p>Welcome, {userEmail}</p>

      {/* ===== Summary Section ===== */}
      {dashboardError && <p className="message error">{dashboardError}</p>}

      {dashboardData && (
        <div className="card">
          <h3>Your Financial Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <p className="summary-label">Total Debt</p>
              <p className="summary-value">₹{dashboardData.total_debt}</p>
            </div>
            <div className="summary-item">
              <p className="summary-label">Total Loans</p>
              <p className="summary-value">{dashboardData.total_loans}</p>
            </div>
            <div className="summary-item">
              <p className="summary-label">Health Status</p>
              <p className={`summary-value status-${dashboardData.health_status.toLowerCase()}`}>
                {dashboardData.health_status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== Add Loan Form ===== */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Loan Amount (₹)</label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Overdue Months</label>
            <input
              type="number"
              value={overdueMonths}
              onChange={(e) => setOverdueMonths(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Debt Stress Level</label>
            <select value={stressLevel} onChange={(e) => setStressLevel(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="field">
            <label>AI Response Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Hinglish">Hinglish</option>
            </select>
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Generating Strategy...' : 'Get Negotiation Strategy'}
          </button>
        </form>

        {error && <p className="message error">{error}</p>}

        {strategy && (
          <div className="strategy-box">
            <h3>Your Negotiation Strategy</h3>
            <p>{strategy}</p>
          </div>
        )}
      </div>

      {/* ===== Loans List Section ===== */}
      {dashboardData && dashboardData.loans && dashboardData.loans.length > 0 && (
        <div className="card">
          <h3>Your Loans</h3>
          {dashboardData.loans.map((loan) => (
            <div key={loan.id} className="loan-item">
              <p><strong>Loan Amount:</strong> ₹{loan.loan_amount}</p>
              <p><strong>Overdue Months:</strong> {loan.overdue_months}</p>
              <p><strong>Debt Stress Level:</strong> {loan.debt_stress_level}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard