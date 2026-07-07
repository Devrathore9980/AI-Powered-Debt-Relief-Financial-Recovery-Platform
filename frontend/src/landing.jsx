function Landing({ onGetStarted }) {
  return (
    <div className="Landing">
      <div className="landing-content">
        <span className="eyebrow">FinRelief AI</span>
        <h1>Reduce the Burden of Your Loan, the Smart Way</h1>
        <p className="landing-subtitle">
          AI-powered negotiation strategies that analyze your financial situation and recommend the most effective approach for negotiating with lenders.
        </p>
        <button className="btn-primary btn-hero" onClick={onGetStarted}>
          Start Now →
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
    </div>
  )
}

export default Landing