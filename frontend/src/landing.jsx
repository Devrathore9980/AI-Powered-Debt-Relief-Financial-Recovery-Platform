function Landing({ onGetStarted }) {
  return (
    <div className="Landing">
      <div className="landing-content">
        <span className="eyebrow">FinRelief AI</span>
        <h1>Apne loan ka bojh, samajhdaari se kam karein</h1>
        <p className="landing-subtitle">
          AI-powered negotiation strategies jo aapki financial situation samajh kar,
          lenders ke saath baat karne ka sabse behtar tareeka batati hain.
        </p>
        <button className="btn-primary btn-hero" onClick={onGetStarted}>
          Shuru Karein →
        </button>

        <div className="feature-grid">
          <div className="feature">
            <span className="feature-number">1</span>
            <p>Apna loan detail share karein</p>
          </div>
          <div className="feature">
            <span className="feature-number">2</span>
            <p>AI aapke liye strategy banayega</p>
          </div>
          <div className="feature">
            <span className="feature-number">3</span>
            <p>Confidence ke saath negotiate karein</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing