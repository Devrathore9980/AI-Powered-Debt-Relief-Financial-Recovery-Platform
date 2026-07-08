import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

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

  const [emailContent, setEmailContent] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [copied, setCopied] = useState(false)

  const [dashboardData, setDashboardData] = useState(null)
  const [dashboardError, setDashboardError] = useState('')

  const [aiHistory, setAiHistory] = useState([])
  const [historyError, setHistoryError] = useState('')
  const [debtTimeline, setDebtTimeline] = useState([])
  const [timelineError, setTimelineError] = useState('')
  const [activeTab, setActiveTab] = useState('history')
  const [expandedId, setExpandedId] = useState(null)

  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)

  // Naya — Theme toggle
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const token = localStorage.getItem('token')
  const authHeader = { headers: { Authorization: `Bearer ${token}` } }

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard-data`, authHeader)
      setDashboardData(response.data)
    } catch (err) {
      setDashboardError(err.response ? err.response.data.detail : 'Dashboard data cannot be loaded')
    }
  }

  const fetchAiHistory = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/ai-history`, authHeader)
      setAiHistory(response.data)
    } catch (err) {
      setHistoryError(err.response ? err.response.data.detail : 'AI history cannot be loaded')
    }
  }

  const fetchDebtTimeline = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/debt-timeline`, authHeader)
      setDebtTimeline(response.data)
    } catch (err) {
      setTimelineError(err.response ? err.response.data.detail : 'Debt timeline cannot be loaded')
    }
  }

  useEffect(() => {
    fetchDashboardData()
    fetchAiHistory()
    fetchDebtTimeline()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setStrategy('')
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/debt-record`, {
        user_email: userEmail,
        loan_amount: parseFloat(loanAmount),
        overdue_months: parseInt(overdueMonths),
        debt_stress_level: stressLevel,
        language: language
      })
      setStrategy(response.data.ai_strategy)
      fetchDashboardData()
      fetchAiHistory()
      fetchDebtTimeline()
    } catch (err) {
      setError(err.response ? err.response.data.detail : 'Unable to connect with backend')
    } finally {
      setLoading(false)
    }
  }

  const handleSettlementPredict = async () => {
    setPredictionLoading(true)
    setPredictionError('')
    setPrediction('')
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/settlement-predictor`, {
        loan_amount: parseFloat(loanAmount),
        overdue_months: parseInt(overdueMonths),
        debt_stress_level: stressLevel,
        language: language
      })
      setPrediction(response.data.prediction)
    } catch (err) {
      setPredictionError(err.response ? err.response.data.detail : 'Unable to connect with backend')
    } finally {
      setPredictionLoading(false)
    }
  }

  const handleGenerateEmail = async () => {
    setEmailLoading(true)
    setEmailError('')
    setEmailContent('')
    setCopied(false)
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/generate-negotiation-email`, {
        loan_amount: parseFloat(loanAmount),
        overdue_months: parseInt(overdueMonths),
        debt_stress_level: stressLevel,
        lender_name: lenderName || 'Lender',
        language: language
      })
      setEmailContent(response.data.email_content)
    } catch (err) {
      setEmailError(err.response ? err.response.data.detail : 'Unable to connect with backend')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteLoan = async (loanId) => {
    const confirmed = window.confirm('Are you sure you want to delete this loan record? This action cannot be undone.')
    if (!confirmed) return
    setDeletingId(loanId)
    setDeleteError('')
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/loans/${loanId}`,  authHeader)
      fetchDashboardData()
      fetchAiHistory()
      fetchDebtTimeline()
    } catch (err) {
      setDeleteError(err.response ? err.response.data.detail : 'Failed to delete the loan')
    } finally {
      setDeletingId(null)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMsg('')
    setProfileError('')
    const updates = {}
    if (newName.trim()) updates.name = newName.trim()
    if (newPassword.trim()) updates.password = newPassword.trim()
    if (Object.keys(updates).length === 0) {
      setProfileError('Fill at least one field (Name or Password)')
      setProfileLoading(false)
      return
    }
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/update-profile`,  updates, authHeader)
      setProfileMsg('Profile update ho gaya!')
      setNewName('')
      setNewPassword('')
    } catch (err) {
      setProfileError(err.response ? err.response.data.detail : 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const formatShortDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }


  // ===== Chart data (real, computed from actual loans) =====


  let runningTotal = 0
  const timelineChartData = debtTimeline.map((item) => {
    runningTotal += item.loan_amount
    return { date: formatShortDate(item.created_at), total: runningTotal }
  })

  const stressColors = { Low: '#1FA894', Medium: '#E0AC4B', High: '#E0605A' }
  const breakdownChartData = ['Low', 'Medium', 'High']
    .map((level) => ({
      name: level,
      value: (dashboardData?.loans || [])
        .filter((l) => l.debt_stress_level === level)
        .reduce((sum, l) => sum + l.loan_amount, 0)
    }))
    .filter((d) => d.value > 0)

  const insightText = dashboardData
    ? `Aapke ${dashboardData.total_loans} loan(s) mein total ₹${dashboardData.total_debt} outstanding hai. Health status "${dashboardData.health_status}" hai. ${
        dashboardData.health_status === 'Critical'
          ? 'Turant ek settlement plan generate karne ki salah di jaati hai.'
          : dashboardData.health_status === 'Moderate'
          ? 'Ek structured negotiation strategy isse improve kar sakti hai.'
          : 'Repayment discipline achhi lag rahi hai, aise hi jaari rakho.'
      }`
    : 'Add your first loan to see AI insights here.'

  return (
    <div className="dashboard-page">
      {/* ===== Top Navbar ===== */}
      <nav className="navbar-full">
        <div className="navbar-inner">
          <div className="navbar-logo">FinRelief <span>AI</span></div>
          <div className="navbar-links">
            <button className="nav-link nav-link-active" onClick={() => scrollTo('top-of-dashboard')}>Dashboard</button>
            <button className="nav-link" onClick={() => scrollTo('loans-section')}>Loans</button>
            <button className="nav-link" onClick={() => scrollTo('history-section')}>History</button>
            <button className="nav-link" onClick={() => scrollTo('profile-section')}>Profile</button>
          </div>
          <div className="navbar-right">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark/light mode">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="avatar">{userEmail?.charAt(0).toUpperCase()}</div>
            <button className="btn-logout" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="Dashboard" id="top-of-dashboard">
        <p className="eyebrow">FINANCIAL OVERVIEW</p>
        <h1 className="dash-title">Your Debt Recovery Dashboard</h1>
        <p className="dash-subtitle">AI-powered insights to accelerate your path to financial freedom</p>

        {/* ===== AI Insight Banner ===== */}
        <div className="insight-banner">
          <span className="insight-icon">🧠</span>
          <p><strong>AI Insight:</strong> {insightText}</p>
          <button className="btn-view-plan" onClick={() => scrollTo('history-section')}>View Plan →</button>
        </div>

        {dashboardError && <p className="message error">{dashboardError}</p>}


        {/* ===== Stat Cards ===== */}


        {dashboardData && (
          <div className="stat-grid">
            <div className="stat-card stat-teal">
              <span className="stat-icon">💰</span>
              <p className="stat-label">Total Outstanding Debt</p>
              <p className="stat-value">₹{dashboardData.total_debt}</p>
            </div>
            <div className="stat-card stat-gold">
              <span className="stat-icon">📄</span>
              <p className="stat-label">Total Loans</p>
              <p className="stat-value">{dashboardData.total_loans}</p>
            </div>
            <div className={`stat-card stat-status-${dashboardData.health_status.toLowerCase()}`}>
              <span className="stat-icon">🩺</span>
              <p className="stat-label">Health Status</p>
              <p className="stat-value">{dashboardData.health_status}</p>
            </div>
            <div className="stat-card stat-blue">
              <span className="stat-icon">🤖</span>
              <p className="stat-label">AI Strategies Generated</p>
              <p className="stat-value">{aiHistory.length}</p>
            </div>
          </div>
        )}


        {/* ===== Charts ===== */}


        {dashboardData && dashboardData.loans && dashboardData.loans.length > 0 && (
          <div className="chart-grid">
            <div className="chart-card">
              <h3>Total Debt Added Over Time</h3>
              <p className="chart-sub">Cumulative debt as loans were added</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={timelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="date" stroke="var(--ink-muted)" fontSize={12} />
                  <YAxis stroke="var(--ink-muted)" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink)' }} />
                  <Line type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Debt Breakdown</h3>
              <p className="chart-sub">By stress level</p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={breakdownChartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {breakdownChartData.map((entry, index) => (
                      <Cell key={index} fill={stressColors[entry.name]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ===== Profile Settings ===== */}
        <div className="card" id="profile-section">
          <div className="profile-toggle" onClick={() => setShowProfileForm(!showProfileForm)}>
            <h3>Profile Settings</h3>
            <span className="expand-icon">{showProfileForm ? '−' : '+'}</span>
          </div>
          {showProfileForm && (
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="field">
                <label>New Name (optional)</label>
                <input type="text" placeholder="Apna naya naam likho" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div className="field">
                <label>New Password (optional)</label>
                <input type="password" placeholder="Naya password likho" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <button className="btn-primary" type="submit" disabled={profileLoading}>
                {profileLoading ? 'Updating...' : 'Update Profile'}
              </button>
              {profileMsg && <p className="message success">{profileMsg}</p>}
              {profileError && <p className="message error">{profileError}</p>}
            </form>
          )}
        </div>


        {/* ===== Add Loan Form ===== */}


        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Loan Amount (₹)</label>
              <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} required />
            </div>
            <div className="field">
              <label>Overdue Months</label>
              <input type="number" value={overdueMonths} onChange={(e) => setOverdueMonths(e.target.value)} required />
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
              <input type="text" placeholder="e.g. HDFC Bank, Bajaj Finserv" value={lenderName} onChange={(e) => setLenderName(e.target.value)} />
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
              <button type="button" className="btn-secondary" onClick={handleSettlementPredict} disabled={predictionLoading || !loanAmount || !overdueMonths}>
                {predictionLoading ? 'Predicting...' : 'Get Settlement Prediction'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleGenerateEmail} disabled={emailLoading || !loanAmount || !overdueMonths}>
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


        {/* ===== Loans List ===== */}


        {dashboardData && dashboardData.loans && dashboardData.loans.length > 0 && (
          <div className="card" id="loans-section">
            <h3>Your Loans</h3>
            {deleteError && <p className="message error">{deleteError}</p>}
            {dashboardData.loans.map((loan) => (
              <div key={loan.id} className="loan-item">
                <div className="loan-item-row">
                  <div>
                    <p><strong>Loan Amount:</strong> ₹{loan.loan_amount}</p>
                    <p><strong>Overdue Months:</strong> {loan.overdue_months}</p>
                    <p><strong>Debt Stress Level:</strong> {loan.debt_stress_level}</p>
                  </div>
                  <button type="button" className="btn-delete" onClick={() => handleDeleteLoan(loan.id)} disabled={deletingId === loan.id}>
                    {deletingId === loan.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}


        {/* ===== History / Timeline Tabs ===== */}


        <div className="card" id="history-section">
          <div className="tab-row">
            <button type="button" className={`tab-btn ${activeTab === 'history' ? 'tab-active' : ''}`} onClick={() => setActiveTab('history')}>
              AI Strategy History
            </button>
            <button type="button" className={`tab-btn ${activeTab === 'timeline' ? 'tab-active' : ''}`} onClick={() => setActiveTab('timeline')}>
              Debt Timeline
            </button>
          </div>

          {activeTab === 'history' && (
            <div className="tab-content">
              {historyError && <p className="message error">{historyError}</p>}
              {aiHistory.length === 0 && !historyError && (
                <p className="empty-state">Abhi tak koi AI strategy generate nahi hui hai. Ek loan add karo upar!</p>
              )}
              {aiHistory.map((item) => (
                <div key={item.loan_id} className="history-item">
                  <div className="history-item-header" onClick={() => setExpandedId(expandedId === item.loan_id ? null : item.loan_id)}>
                    <span>Loan #{item.loan_id} — ₹{item.loan_amount}</span>
                    <span className="expand-icon">{expandedId === item.loan_id ? '−' : '+'}</span>
                  </div>
                  {expandedId === item.loan_id && <p className="history-strategy-text">{item.ai_strategy}</p>}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="tab-content">
              {timelineError && <p className="message error">{timelineError}</p>}
              {debtTimeline.length === 0 && !timelineError && (
                <p className="empty-state">Abhi tak timeline mein kuch nahi hai. Ek loan add karo upar!</p>
              )}
              <div className="timeline">
                {debtTimeline.map((item) => (
                  <div key={item.loan_id} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <p className="timeline-date">{formatDate(item.created_at)}</p>
                      <p><strong>₹{item.loan_amount}</strong> loan added, {item.overdue_months} months overdue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard