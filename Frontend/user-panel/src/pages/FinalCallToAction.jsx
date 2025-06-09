// FinalCallToAction.jsx
import React from 'react';
import './FinalCallToAction.css';

const FinalCallToAction = () => {
  return (
    <section className="final-cta-section">
      <h2>🚀 Ready to Turn Your College Knowledge into <span>Rewards?</span></h2>
      <p>Don't miss out on the chance to win amazing prizes just by sharing what you already know. <br/>Join the Shikshaarthi Supercoin revolution today!</p>
      <div className="cta-buttons-container">
        <a href="/sign-up" className="cta-button primary">🏆 Join & Start Earning!</a>
        <a href="/add" className="cta-button secondary">📝 Submit Information Now</a>
      </div>
    </section>
  );
};
export default FinalCallToAction;