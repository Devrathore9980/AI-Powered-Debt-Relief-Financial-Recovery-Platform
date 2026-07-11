import { useState } from 'react'

function Landing({ onGetStarted }) {
  const [zooming, setZooming] = useState(false)

  const handleStart = () => {
    setZooming(true)
    setTimeout(() => {
      onGetStarted()
    }, 1200)
  }

  return (
    <div className="Landing">
      {/* Floating background cards */}
      <div className="landing-bg-cards">
        <div className="floating-card fc-1"></div>
        <div className="floating-card fc-2"></div>
        <div className="floating-card fc-3"></div>
        <div className="floating-card fc-4"></div>
        <div className="floating-card fc-5"></div>
        <div className="floating-card fc-6"></div>
        <div className="floating-card fc-7"></div>
        <div className="floating-card fc-8"></div>
      </div>

      <div className="landing-content">
        <span className="eyebrow">FinRelief AI</span>
        <h1>Reduce the Burden of Your Loan, the Smart Way</h1>
        <p className="landing-subtitle">
          AI-powered negotiation strategies that analyze your financial situation and recommend the most effective approach for negotiating with lenders.
        </p>
        <button className="btn-primary btn-hero" onClick={handleStart}>
          Start Now &rarr;
        </button>

        <div className="feature-grid">
          <div className="feature">
            <span className="feature-number">1</span>
            <p>Share Your Loan Details</p>
          </div>
          <div className="feature">
            <span className="feature-number">2</span>
            <p>AI aapke liye strategy banayega</p>
          </div>
          <div className="feature">
            <span className="feature-number">3</span>
            <p>Negotiate with confidence</p>
          </div>
        </div>
      </div>

      {/* Zoom transition overlay */}
      {zooming && (
        <div className="card-zoom-overlay">
          <div className="zoom-card"></div>
        </div>
      )}
    </div>
  )
}

export default Landing