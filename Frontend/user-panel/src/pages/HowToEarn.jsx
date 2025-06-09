// HowToEarn.jsx
import React from 'react';
import './HowToEarn.css';
// Assuming you have an icon component or use <i> tags with a library like FontAwesome
// import { FaSignInAlt, FaHome, FaUtensils, FaBriefcaseMedical, FaTools } from 'react-icons/fa';

const earningActions = [
  { icon: '🧑‍🎓', title: 'Login to Shikshaarthi', coins: 50, description: '(One-time on first login)' },
  { icon: '🏠', title: 'Share Rental Room Info', coins: 20, description: 'Help find perfect student homes.' },
  { icon: '🍛', title: 'Share Mess Service Info', coins: 15, description: 'List trusted tiffin & mess options.' },
  { icon: '🏥', title: 'Share Healthcare Info', coins: 10, description: 'Nearby clinics, doctors, pharmacies.' },
  { icon: '🛠️', title: 'Share Household Services', coins: 15, description: 'Plumbers, electricians, laundry, etc.' },
];

const HowToEarn = () => {
  return (
    <section className="how-to-earn-section">
      <h2 className="section-title">How to <span>Earn Supercoins</span> 💰</h2>
      <p className="section-subtitle">It's easy to stack up Supercoins! Here’s how you can contribute and earn:</p>
      <div className="earning-cards-grid">
        {earningActions.map((action, index) => (
          <div className="earning-card" key={index}>
            <div className="card-icon">{action.icon /* <action.icon /> if using react-icons */}</div>
            <h3 className="card-title">{action.title}</h3>
            <p className="card-description">{action.description}</p>
            <div className="card-coins">+{action.coins} Supercoins</div>
          </div>
        ))}
      </div>
      <p className="verification-note">
        <strong>Important:</strong> Supercoins are credited after our team verifies the originality and accuracy of the shared information. No coins for duplicate entries!
      </p>
    </section>
  );
};
export default HowToEarn;