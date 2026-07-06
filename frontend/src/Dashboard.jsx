import { useState, useEffect } from 'react'
import axios from 'axios'

function Dashboard({ userEmail, onLogout }) {
  const [loanAmount, setLoanAmount] = useState('')
  const [overdueMonths, setOverdueMonths] = useState('')
  const [stressLevel, setStressLevel] = useState('Medium')
  const [language, setLanguage] = useState('English')
  const [lenderName, setLenderName] = useState('')
  const [strategy, setStrategy] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [prediction, setPrediction] = useState('')
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [predictionError, setPredictionError] = useState('')

  // Naye states — Email Generator ke liye
  const [emailContent, setEmailContent] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [copied, setCopied] = useState(false)

  const [dashboardData, setDashboardData] = useState(null)
  const [dashboardError, setDashboardError] = useState('')

  const token = localStorage.getItem('token')

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
      fetchDashboardData()
    } catch (err) {
      setError(err.response ? err.response.data.detail : 'Backend se connect nahi ho paya')
    } finally {
      setLoading(false)
    }
  }

  const handleSettlementPredict = async () => {
    setPredictionLoading(true)
    setPredictionError('')
    setPrediction('')

    try {
      const response = await axios.post('http://127.0.0.1:8000/settlement-predictor', {
        loan_amount: parseFloat(loanAmount),
        overdue_months: parseInt(overdueMonths),
        debt_stress_level: stressLevel,
        language: language
      })
      setPrediction(response.data.prediction)
    } catch (err) {
      setPredictionError(err.response ? err.response.data.detail : 'Backend se connect nahi ho paya')
    } finally {
      setPredictionLoading(false)
    }
  }

  // Naya function — Negotiation Email generate karne ke liye
  const handleGenerateEmail = async () => {
    setEmailLoading(true)
    setEmailError('')
    setEmailContent('')
    setCopied(false)

    try {
      const response = await axios.post('http://127.0.0.1:8000/generate-negotiation-email', {
        loan_amount: parseFloat(loanAmount),
        overdue_months: parseInt(overdueMonths),
        debt_stress_level: stressLevel,
        lender_name: lenderName || 'Lender',
        language: language
      })
      setEmailContent(response.data.email_content)
    } catch (err) {
      setEmailError(err.response ? err.response.data.detail : 'Backend se connect nahi ho paya')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="Dashboard">
      <div className="top-bar">
        <h1>FinRelief AI</h1>
        <button onClick={onLogout}>Logout</button>
      </div>
      <p>Welcome, {userEmail}</p>

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
            <label>Lender Name (email ke liye)</label>
            <input
              type="text"
              placeholder="e.g. HDFC Bank, Bajaj Finserv"
              value={lenderName}
              onChange={(e) => setLenderName(e.target.value)}
            />
          </div>
          <div className="field">
            <label>AI Response Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Hinglish">Hinglish</option>
            </select>
          </div>

          <div className="button-row">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Generating Strategy...' : 'Get Negotiation Strategy'}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleSettlementPredict}
              disabled={predictionLoading || !loanAmount || !overdueMonths}
            >
              {predictionLoading ? 'Predicting...' : 'Get Settlement Prediction'}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleGenerateEmail}
              disabled={emailLoading || !loanAmount || !overdueMonths}
            >
              {emailLoading ? 'Writing Email...' : 'Generate Negotiation Email'}
            </button>
          </div>
        </form>

        {error && <p className="message error">{error}</p>}
        {predictionError && <p className="message error">{predictionError}</p>}
        {emailError && <p className="message error">{emailError}</p>}

        {strategy && (
          <div className="strategy-box">
            <h3>Your Negotiation Strategy</h3>
            <p>{strategy}</p>
          </div>
        )}

        {prediction && (
          <div className="strategy-box prediction-box">
            <h3>Settlement Prediction</h3>
            <p>{prediction}</p>
          </div>
        )}

        {emailContent && (
          <div className="strategy-box email-box">
            <div className="email-box-header">
              <h3>Negotiation Email (ready to send)</h3>
              <button type="button" className="btn-copy" onClick={handleCopyEmail}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="email-text">{emailContent}</pre>
          </div>
        )}
      </div>

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